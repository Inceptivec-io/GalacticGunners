from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from leaderboard.models import LeaderboardEntry
from levels.models import Level, LevelVersion
from games.models import OwnerScope
from .models import CampaignRun
from campaigns.services import capability_matches

from .models import GameRun, GameVersion, ScoreSubmission
from .validation import validate_completion


class GameRunSerializer(serializers.ModelSerializer):
    validation_state = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()

    class Meta:
        model = GameRun
        fields = ['id', 'validation_state', 'started_at', 'level', 'seed']

    def get_validation_state(self, _run):
        return 'ACTIVE'

    def get_level(self, run):
        return {
            'slug': run.level.slug,
            'version': run.level_version,
            'checksum': run.level_checksum,
        }


class StartGameRunSerializer(serializers.Serializer):
    game_version = serializers.CharField(min_length=1, max_length=32)
    client_type = serializers.ChoiceField(choices=GameRun.ClientType.choices)
    level_slug = serializers.SlugField()
    level_version = serializers.IntegerField(min_value=1)
    level_checksum = serializers.RegexField(r'^[0-9a-fA-F]{64}$')
    seed = serializers.IntegerField(min_value=0, max_value=2147483647)
    campaign_run_id = serializers.UUIDField(required=False)
    campaign_entry_id = serializers.UUIDField(required=False)

    def validate(self, attrs):
        version = GameVersion.objects.filter(version=attrs['game_version'], is_active=True).first()
        if not version:
            raise serializers.ValidationError({'game_version': 'GAME_VERSION_MISMATCH'})
        level = Level.objects.select_related('active_version').filter(
            slug=attrs['level_slug'], archived=False, game_project__owner_scope=OwnerScope.CORE,
        ).first()
        if not level or not level.active_version or level.active_version.status != LevelVersion.Status.PUBLISHED:
            raise serializers.ValidationError({'level_slug': 'LEVEL_NOT_PUBLISHED'})
        active = level.active_version
        if active.version != attrs['level_version']:
            raise serializers.ValidationError({'level_version': 'LEVEL_VERSION_MISMATCH'})
        if active.checksum.lower() != attrs['level_checksum'].lower():
            raise serializers.ValidationError({'level_checksum': 'LEVEL_CHECKSUM_MISMATCH'})
        attrs['resolved_version'] = version
        attrs['resolved_level'] = level
        campaign_run_id = attrs.get('campaign_run_id')
        campaign_entry_id = attrs.get('campaign_entry_id')
        if bool(campaign_run_id) != bool(campaign_entry_id):
            raise serializers.ValidationError({'campaign_run_id': 'CAMPAIGN_CONTEXT_INCOMPLETE'})
        if campaign_run_id:
            request = self.context['request']
            try:
                campaign_run = CampaignRun.objects.select_related('current_entry__level_version__level').get(pk=campaign_run_id)
            except CampaignRun.DoesNotExist as exc:
                raise serializers.ValidationError({'campaign_run_id': 'CAMPAIGN_RUN_NOT_FOUND'}) from exc
            if campaign_run.player_id:
                if not request.user.is_authenticated or request.user.pk != campaign_run.player_id:
                    raise serializers.ValidationError({'campaign_run_id': 'CAMPAIGN_OWNER_REQUIRED'})
            elif not capability_matches(request.headers.get('X-Campaign-Token'), campaign_run.anonymous_capability_hash):
                raise serializers.ValidationError({'campaign_run_id': 'CAMPAIGN_CAPABILITY_INVALID'})
            entry = campaign_run.current_entry
            if campaign_run.status != CampaignRun.Status.ACTIVE or not entry or str(entry.pk) != str(campaign_entry_id):
                raise serializers.ValidationError({'campaign_entry_id': 'CAMPAIGN_ENTRY_MISMATCH'})
            if entry.level_version.level_id != level.id or entry.level_version.version != active.version or entry.level_version.checksum != active.checksum:
                raise serializers.ValidationError({'level_slug': 'CAMPAIGN_LEVEL_MISMATCH'})
            attrs['campaign_run'] = campaign_run
            attrs['campaign_entry'] = entry
        return attrs

    def create(self, data):
        request = self.context.get('request')
        campaign_run = data.get('campaign_run')
        return GameRun.objects.create(
            player=request.user if request and request.user.is_authenticated else None,
            campaign_run=campaign_run,
            campaign_entry=data.get('campaign_entry'),
            sequence=campaign_run.current_entry.position if campaign_run else None,
            attempt=campaign_run.attempts.filter(sequence=campaign_run.current_entry.position).count() + 1 if campaign_run else None,
            game_version=data['resolved_version'], level=data['resolved_level'], level_version=data['level_version'],
            level_checksum=data['level_checksum'].lower(), seed=data['seed'], client_type=data['client_type'],
            lives_start=campaign_run.lives if campaign_run else 3, nukes_start=campaign_run.nukes if campaign_run else 2,
            entry_lives=campaign_run.lives if campaign_run else 3, entry_nukes=campaign_run.nukes if campaign_run else 2,
        )


class CompleteGameRunSerializer(serializers.Serializer):
    completed_at = serializers.DateTimeField(required=False)
    score = serializers.IntegerField(min_value=0)
    level_reached = serializers.IntegerField(min_value=1, max_value=10000)
    lives_end = serializers.IntegerField(min_value=0, max_value=3)
    nukes_end = serializers.IntegerField(min_value=0, max_value=2)
    victory = serializers.BooleanField()
    duration_ms = serializers.IntegerField(min_value=0)
    event_summary = serializers.DictField()
    trace_digest = serializers.CharField(required=False, allow_blank=True, max_length=128)
    idempotency_key = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=128)

    @transaction.atomic
    def complete(self, run):
        if run.completed_at is not None:
            raise serializers.ValidationError({'detail': 'RUN_ALREADY_SUBMITTED'}, code='already_completed')
        data = self.validated_data
        outcome = validate_completion(run, data)
        try:
            ScoreSubmission.objects.create(run=run, claimed_score=data['score'], event_summary=data['event_summary'], idempotency_key=data.get('idempotency_key') or None, expected_score=outcome.expected_score, accepted_score=outcome.expected_score if outcome.accepted else None, validation_result='ACCEPTED' if outcome.accepted else 'REJECTED', rejection_codes=outcome.codes, validation_detail={**outcome.detail, 'trace_digest': data.get('trace_digest', '')}, validated_at=timezone.now())
        except IntegrityError as exc:
            raise serializers.ValidationError({'detail': 'DUPLICATE_SUBMISSION'}, code='duplicate_submission') from exc
        now = timezone.now()
        run.score = outcome.expected_score if outcome.accepted else 0
        run.level_reached = str(data['level_reached'])
        run.lives_end = data['lives_end']
        run.lives_used = run.lives_start - data['lives_end']
        run.nukes_end = data['nukes_end']
        run.nukes_used = data['event_summary'].get('nuke_uses', 0)
        run.victory = data['victory']
        run.duration_ms = data['duration_ms']
        run.completed_at = now
        run.submitted_at = now
        run.validity = GameRun.Validity.VALID if outcome.accepted else GameRun.Validity.REJECTED
        run.accepted_at = now if outcome.accepted else None
        run.validation_code = '' if outcome.accepted else outcome.codes[0]
        run.validation_result = {'accepted': outcome.accepted, 'codes': outcome.codes, 'detail': outcome.detail}
        run.save()
        if outcome.accepted and run.player_id and getattr(run.player, 'player_profile', None) and run.player.player_profile.leaderboard_enabled and run.player.player_profile.moderation_state == 'VISIBLE':
            LeaderboardEntry.objects.create(run=run, score=run.score, display_name=run.player.player_profile.display_name, campaign_level_reached=data['level_reached'], victory=run.victory, accepted_at=now)
        return run


class CompletedGameRunSerializer(serializers.ModelSerializer):
    run_id = serializers.UUIDField(source='id')
    validation_state = serializers.SerializerMethodField()
    validated_score = serializers.SerializerMethodField()
    leaderboard_eligible = serializers.SerializerMethodField()
    rejection_codes = serializers.SerializerMethodField()

    class Meta:
        model = GameRun
        fields = ['run_id', 'validation_state', 'validated_score', 'leaderboard_eligible', 'rejection_codes']

    def get_validation_state(self, run):
        return 'VALIDATED' if run.validity == GameRun.Validity.VALID else 'REJECTED'

    def get_validated_score(self, run):
        return run.score if run.validity == GameRun.Validity.VALID else None

    def get_leaderboard_eligible(self, run):
        return LeaderboardEntry.objects.filter(run=run, visible=True).exists()

    def get_rejection_codes(self, run):
        return run.validation_result.get('codes', [])
