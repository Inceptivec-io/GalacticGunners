from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from leaderboard.models import LeaderboardEntry

from .models import GameRun, GameVersion, ScoreSubmission


class GameRunSerializer(serializers.ModelSerializer):
    game_version = serializers.CharField(source='game_version.version')

    class Meta:
        model = GameRun
        fields = [
            'id',
            'game_version',
            'client_type',
            'started_at',
            'completed_at',
            'score',
            'level_reached',
            'lives_used',
            'nukes_used',
            'victory',
            'validity',
        ]


class StartGameRunSerializer(serializers.Serializer):
    game_version = serializers.CharField(min_length=1, max_length=32)
    client_type = serializers.ChoiceField(choices=GameRun.ClientType.choices)

    def create(self, validated_data):
        version, _ = GameVersion.objects.get_or_create(version=validated_data['game_version'])
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        return GameRun.objects.create(
            player=user,
            game_version=version,
            client_type=validated_data['client_type'],
        )


class CompleteGameRunSerializer(serializers.Serializer):
    claimed_score = serializers.IntegerField(min_value=0)
    level_reached = serializers.CharField(required=False, allow_blank=True, max_length=32)
    lives_used = serializers.IntegerField(min_value=0, default=0)
    nukes_used = serializers.IntegerField(min_value=0, default=0)
    victory = serializers.BooleanField(default=False)
    event_summary = serializers.DictField(default=dict)
    payload_hash = serializers.RegexField(
        r'^[0-9a-fA-F]{64}$',
        required=False,
        allow_blank=True,
        max_length=64,
    )
    idempotency_key = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=128,
    )

    def validate(self, attrs):
        attrs['level_reached'] = attrs.get('level_reached', '')
        attrs['payload_hash'] = attrs.get('payload_hash', '')
        idempotency_key = attrs.get('idempotency_key') or None
        attrs['idempotency_key'] = idempotency_key
        return attrs

    @transaction.atomic
    def complete(self, run):
        if run.completed_at is not None:
            raise serializers.ValidationError(
                {'detail': 'Game run is already completed.'},
                code='already_completed',
            )

        data = self.validated_data
        ScoreSubmission.objects.create(
            run=run,
            claimed_score=data['claimed_score'],
            event_summary=data['event_summary'],
            payload_hash=data['payload_hash'],
            idempotency_key=data['idempotency_key'],
        )

        run.score = max(0, data['claimed_score'])
        run.level_reached = data['level_reached']
        run.lives_used = data['lives_used']
        run.nukes_used = data['nukes_used']
        run.victory = data['victory']
        run.completed_at = timezone.now()
        run.validity = GameRun.Validity.VALID
        run.validation_result = {
            'policy': 'foundation_non_negative_claimed_score_v1',
            'accepted': True,
            'notes': 'Server-owned deterministic foundation validation; anti-cheat is not claimed.',
        }
        run.save(update_fields=[
            'score',
            'level_reached',
            'lives_used',
            'nukes_used',
            'victory',
            'completed_at',
            'validity',
            'validation_result',
        ])

        display_name = 'GUEST'
        if run.player_id and hasattr(run.player, 'player_profile'):
            display_name = run.player.player_profile.display_name

        if run.is_publishable:
            LeaderboardEntry.objects.create(
                run=run,
                score=run.score,
                display_name=display_name,
            )

        return run


class CompletedGameRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameRun
        fields = [
            'id',
            'score',
            'level_reached',
            'lives_used',
            'nukes_used',
            'victory',
            'validity',
            'completed_at',
        ]
