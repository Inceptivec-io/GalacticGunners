from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from levels.models import LevelVersion

from .models import BoardingRun, BoardingRunEvent, BoardingSubmission, Interior, InteriorVersion
from .services import deterministic_seed, digest, new_capability_token, token_digest


def authored_anchor(config, anchor_id):
    """Resolve the supplied anchor from the pinned published level, never a global constant."""
    for anchor in config.get('boarding_anchors', []):
        if anchor.get('id') != anchor_id:
            continue
        if config.get('schema_version') == '1.1':
            source = next((entity for entity in config.get('entities', []) if entity.get('id') == anchor.get('source_entity_id')), None)
            if source is None:
                return None
            return {
                'anchor_id': anchor['id'], 'source_entity_id': anchor['source_entity_id'],
                'source_entity_type': str(source.get('entity_type', '')).lower(), 'source_ship_type': anchor.get('source_ship_type'),
                'interior_slug': anchor.get('interior', {}).get('slug'), 'interior_version': anchor.get('interior', {}).get('version'),
                'interior_checksum': anchor.get('interior', {}).get('checksum'),
            }
        return {
            'anchor_id': anchor.get('id'), 'source_entity_id': anchor.get('source_entity_id'),
            'source_entity_type': anchor.get('source_entity_type'), 'source_ship_type': anchor.get('source_ship_type'),
            'interior_slug': anchor.get('interior', {}).get('slug'), 'interior_version': anchor.get('interior', {}).get('version'),
            'interior_checksum': anchor.get('interior', {}).get('checksum'),
        }
    return None


class StrictSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError('Object payload required.')
        unknown = set(data) - set(self.fields)
        if unknown:
            raise serializers.ValidationError({key: 'UNKNOWN_FIELD' for key in sorted(unknown)})
        return super().to_internal_value(data)


class ResourcesStartSerializer(StrictSerializer):
    lives = serializers.IntegerField(min_value=1, max_value=3)
    nukes = serializers.IntegerField(min_value=0, max_value=2)


class ResourcesSerializer(StrictSerializer):
    lives = serializers.IntegerField(min_value=0, max_value=3)
    nukes = serializers.IntegerField(min_value=0, max_value=2)


class StartBoardingRunSerializer(StrictSerializer):
    anchor_id = serializers.CharField(max_length=96)
    source_entity_id = serializers.CharField(max_length=128)
    source_entity_type = serializers.CharField(max_length=32)
    source_ship_type = serializers.CharField(max_length=32)
    level_version = serializers.IntegerField(min_value=1)
    level_checksum = serializers.RegexField(r'^[0-9a-f]{64}$')
    interior_slug = serializers.SlugField(max_length=64)
    interior_version = serializers.IntegerField(min_value=1)
    interior_checksum = serializers.RegexField(r'^[0-9a-f]{64}$')
    shooter_state_digest = serializers.RegexField(r'^[0-9a-f]{64}$')
    resources = ResourcesStartSerializer()

    def validate(self, attrs):
        run = self.context['game_run']
        if run.completed_at:
            raise serializers.ValidationError({'game_run': 'GAME_RUN_CLOSED'})
        if run.level_version != attrs['level_version'] or run.level_checksum != attrs['level_checksum']:
            raise serializers.ValidationError({'level': 'LEVEL_VERSION_MISMATCH'})
        authoritative_lives = run.lives_end if run.lives_end is not None else run.lives_start
        authoritative_nukes = run.nukes_end if run.nukes_end is not None else run.nukes_start
        if attrs['resources']['lives'] > authoritative_lives or attrs['resources']['nukes'] > authoritative_nukes:
            raise serializers.ValidationError({'resources': 'RESOURCE_STATE_INVALID'})
        # A campaign attempt is pinned to its immutable CampaignEntry. A later
        # publication may supersede the project's active revision, but cannot
        # invalidate a run that was legitimately started against the old one.
        level_version = run.campaign_entry.level_version if run.campaign_entry_id else None
        if level_version is None:
            try:
                level_version = run.level.versions.get(version=attrs['level_version'], checksum=attrs['level_checksum'], status=LevelVersion.Status.PUBLISHED)
            except LevelVersion.DoesNotExist as exc:
                raise serializers.ValidationError({'level': 'LEVEL_NOT_PUBLISHED'}) from exc
        if level_version.version != attrs['level_version'] or level_version.checksum != attrs['level_checksum']:
            raise serializers.ValidationError({'level': 'LEVEL_VERSION_MISMATCH'})
        expected_anchor = authored_anchor(level_version.config, attrs['anchor_id'])
        if expected_anchor is None:
            raise serializers.ValidationError({'anchor_id': 'BOARDING_ANCHOR_NOT_PRESENT'})
        for key, value in expected_anchor.items():
            if attrs[key] != value:
                raise serializers.ValidationError({key: 'BOARDING_ANCHOR_MISMATCH'})
        try:
            interior = Interior.objects.select_related('active_version').get(slug=attrs['interior_slug'])
            version = interior.versions.get(version=attrs['interior_version'], checksum=attrs['interior_checksum'], status=InteriorVersion.Status.PUBLISHED)
        except (Interior.DoesNotExist, InteriorVersion.DoesNotExist) as exc:
            raise serializers.ValidationError({'interior': 'INTERIOR_VERSION_MISMATCH'}) from exc
        attrs['interior_version_object'] = version
        return attrs

    @transaction.atomic
    def create_or_get(self):
        attrs = self.validated_data
        game_run = self.context['game_run']
        existing = BoardingRun.objects.select_for_update().filter(game_run=game_run, level_version=attrs['level_version'], anchor_id=attrs['anchor_id'], source_entity_id=attrs['source_entity_id']).first()
        if existing:
            return existing, None, False
        token = new_capability_token() if game_run.player_id is None else None
        run = BoardingRun.objects.create(game_run=game_run, player=game_run.player, level=game_run.level, level_version=attrs['level_version'], level_checksum=attrs['level_checksum'], source_entity_id=attrs['source_entity_id'], source_entity_type=attrs['source_entity_type'], source_ship_type=attrs['source_ship_type'], anchor_id=attrs['anchor_id'], interior_version=attrs['interior_version_object'], interior_checksum=attrs['interior_checksum'], seed=deterministic_seed(game_run.seed, attrs['source_entity_id'], attrs['interior_checksum']), lives_start=attrs['resources']['lives'], nukes_start=attrs['resources']['nukes'], shooter_state_digest=attrs['shooter_state_digest'], capability_token_hash=token_digest(token) if token else None)
        BoardingRunEvent.objects.create(boarding_run=run, sequence=0, event_type='STARTED', payload={'anchor_id': run.anchor_id}, payload_hash=digest({'anchor_id': run.anchor_id}))
        return run, token, True


class BoardingEventSerializer(StrictSerializer):
    sequence = serializers.IntegerField(min_value=0, max_value=511)
    at_ms = serializers.IntegerField(min_value=0, max_value=60000)
    type = serializers.ChoiceField(choices=['INPUT_CHANGED', 'PLAYER_FIRE', 'PLAYER_HIT', 'PLAYER_RESPAWN', 'ALIEN_FIRE', 'ALIEN_HIT', 'ALIEN_KILLED', 'CONTAINER_OPENED', 'PICKUP_COLLECTED', 'EXIT_INTERACTED', 'TIMEOUT', 'PAUSE_STARTED', 'PAUSE_ENDED'])
    entity_id = serializers.RegexField(r'^[a-z][a-z0-9-]*$', max_length=64)
    target_id = serializers.RegexField(r'^[a-z][a-z0-9-]*$', max_length=64, required=False)
    value = serializers.ChoiceField(choices=['LIFE', 'NUKE', 'EMPTY'], required=False)
    horizontal = serializers.IntegerField(min_value=-1, max_value=1, required=False)
    pressed_actions = serializers.ListField(child=serializers.ChoiceField(choices=['JUMP', 'FIRE', 'INTERACT']), required=False, max_length=3)


class CompleteBoardingRunSerializer(StrictSerializer):
    outcome = serializers.ChoiceField(choices=BoardingRun.Outcome.choices)
    duration_ms = serializers.IntegerField(min_value=0, max_value=60000)
    resources_end = ResourcesSerializer()
    aliens_killed = serializers.IntegerField(min_value=0, max_value=6)
    containers_opened = serializers.IntegerField(min_value=0, max_value=4)
    lives_found = serializers.IntegerField(min_value=0, max_value=4)
    nukes_found = serializers.IntegerField(min_value=0, max_value=4)
    score_events = serializers.ListField(max_length=0)
    shooter_state_digest = serializers.RegexField(r'^[0-9a-f]{64}$')
    events = BoardingEventSerializer(many=True, max_length=512)

    def validate_events(self, events):
        sequences = [event['sequence'] for event in events]
        if sequences != list(range(len(events))):
            raise serializers.ValidationError('EVENT_SEQUENCE_INVALID')
        if any(events[index]['at_ms'] > events[index + 1]['at_ms'] for index in range(len(events) - 1)):
            raise serializers.ValidationError('EVENT_TIME_NOT_MONOTONIC')
        return events

    @transaction.atomic
    def complete(self, boarding_run, idempotency_key):
        run = BoardingRun.objects.select_for_update().select_related('game_run').get(pk=boarding_run.pk)
        parent = type(run.game_run).objects.select_for_update().get(pk=run.game_run_id)
        summary = self.validated_data
        summary_hash = digest(summary)
        if hasattr(run, 'submission'):
            if run.submission.idempotency_key == idempotency_key and run.submission.summary_hash == summary_hash:
                return run
            raise serializers.ValidationError({'detail': 'IDEMPOTENCY_CONFLICT'})
        if run.status != BoardingRun.Status.ACTIVE:
            raise serializers.ValidationError({'detail': 'BOARDING_RUN_CLOSED'})
        if summary['shooter_state_digest'] != run.shooter_state_digest:
            raise serializers.ValidationError({'detail': 'SHOOTER_STATE_DIGEST_MISMATCH'})
        if summary['outcome'] == BoardingRun.Outcome.TIMEOUT:
            if summary['duration_ms'] != 60000 or len(summary['events']) != 1 or summary['events'][0]['type'] != 'TIMEOUT' or summary['events'][0]['at_ms'] != 60000:
                raise serializers.ValidationError({'detail': 'TIMEOUT_DURATION_INVALID'})
        if summary['outcome'] == BoardingRun.Outcome.SUCCESS:
            if not any(event['type'] == 'EXIT_INTERACTED' and event['at_ms'] < 60000 for event in summary['events']):
                raise serializers.ValidationError({'detail': 'SUCCESS_EXIT_REQUIRED'})
        resources_end = summary['resources_end']
        if summary['outcome'] == BoardingRun.Outcome.PLAYER_DEAD and resources_end['lives'] != 0:
            raise serializers.ValidationError({'detail': 'PLAYER_DEAD_LIVES_INVALID'})
        expected_lives = min(3, run.lives_start + summary['lives_found'])
        expected_nukes = min(2, run.nukes_start + summary['nukes_found'])
        if summary['outcome'] in (BoardingRun.Outcome.TIMEOUT, BoardingRun.Outcome.PLAYER_DEAD):
            expected_lives = max(0, expected_lives - 1)
        if summary['outcome'] == BoardingRun.Outcome.ABORTED:
            if summary['lives_found'] or summary['nukes_found'] or summary['aliens_killed'] or summary['containers_opened']:
                raise serializers.ValidationError({'detail': 'ABORTED_RETURN_INVALID'})
            expected_lives, expected_nukes = run.lives_start, run.nukes_start
        if resources_end['lives'] != expected_lives or resources_end['nukes'] != expected_nukes:
            raise serializers.ValidationError({'detail': 'RESOURCE_RETURN_INVALID'})
        return_state = {'lives': expected_lives, 'nukes': expected_nukes, 'score_delta': 0, 'remove_source_entity_id': run.source_entity_id}
        BoardingSubmission.objects.create(boarding_run=run, idempotency_key=idempotency_key, raw_summary=summary, summary_hash=summary_hash, accepted=True)
        run.status, run.outcome, run.completed_at, run.duration_ms = BoardingRun.Status.COMPLETED, summary['outcome'], timezone.now(), summary['duration_ms']
        run.lives_end, run.nukes_end, run.aliens_killed, run.containers_opened = expected_lives, expected_nukes, summary['aliens_killed'], summary['containers_opened']
        run.lives_found, run.nukes_found, run.score_events, run.return_state = summary['lives_found'], summary['nukes_found'], [], return_state
        if summary['outcome'] == BoardingRun.Outcome.ABORTED:
            run.status, run.validation_result, run.validation_code, run.return_applied = BoardingRun.Status.REJECTED, BoardingRun.ValidationResult.INVALID, 'ABORTED', False
        else:
            run.validation_result, run.validation_code, run.return_applied = BoardingRun.ValidationResult.VALID, '', True
        run.save()
        if run.return_applied:
            parent.lives_end = expected_lives
            parent.nukes_end = expected_nukes
            parent.save(update_fields=['lives_end', 'nukes_end'])
        # Audit records are server-authored state transitions, not browser trace
        # events.  The exact submitted trace remains immutable in the submission.
        payload = {'outcome': run.outcome, 'summary_hash': summary_hash}
        BoardingRunEvent.objects.create(boarding_run=run, sequence=1, event_type='VALIDATED', payload=payload, payload_hash=digest(payload))
        return run


def boarding_run_payload(run, token=None):
    payload = {'id': str(run.id), 'game_run_id': str(run.game_run_id), 'status': run.status, 'validation_result': run.validation_result, 'validation_code': run.validation_code, 'seed': run.seed, 'time_limit_ms': run.time_limit_ms, 'duration_ms': run.duration_ms, 'interior_slug': run.interior_version.interior.slug, 'interior_version': run.interior_version.version, 'interior_checksum': run.interior_checksum, 'shooter_state_digest': run.shooter_state_digest, 'resources_start': {'lives': run.lives_start, 'nukes': run.nukes_start}, 'return_state': run.return_state, 'counters': {'aliens_killed': run.aliens_killed, 'containers_opened': run.containers_opened, 'lives_found': run.lives_found, 'nukes_found': run.nukes_found}}
    if token:
        payload['boarding_token'] = token
    return payload
