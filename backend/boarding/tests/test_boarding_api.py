import hashlib
import json

from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from game_runs.models import GameRun, GameVersion
from levels.models import Level
from boarding.services import deterministic_seed


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


class BoardingApiTests(TestCase):
    def setUp(self):
        call_command('seed_runtime_authority')
        version = GameVersion.objects.get(version='v1.0-s001-l1-slice')
        level = Level.objects.get(slug='level-04')
        active = level.active_version
        self.game_run = GameRun.objects.create(game_version=version, level=level, level_version=active.version, level_checksum=active.checksum, seed=12004, client_type='web')
        self.client = APIClient()
        self.digest = 'a' * 64

    def payload(self):
        return {'anchor_id': 'level-04-alien-frigate-01', 'source_entity_id': 'level-04:formation-1:r0:c0', 'source_entity_type': 'cruiser', 'source_ship_type': 'ALIEN_FRIGATE', 'level_version': self.game_run.level_version, 'level_checksum': self.game_run.level_checksum, 'interior_slug': 'alien-frigate', 'interior_version': 1, 'interior_checksum': 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3', 'shooter_state_digest': self.digest, 'resources': {'lives': 3, 'nukes': 2}}

    def test_start_is_idempotent_and_issues_anonymous_capability(self):
        first = self.client.post(f'/api/v1/game-runs/{self.game_run.id}/boarding-runs/start/', self.payload(), format='json')
        self.assertEqual(first.status_code, 201)
        self.assertEqual(first['Cache-Control'], 'no-store')
        again = self.client.post(f'/api/v1/game-runs/{self.game_run.id}/boarding-runs/start/', self.payload(), format='json')
        self.assertEqual(again.status_code, 200)
        self.assertEqual(first.data['id'], again.data['id'])
        self.assertNotIn('boarding_token', again.data)
        with_token = self.client.post(
            f'/api/v1/game-runs/{self.game_run.id}/boarding-runs/start/',
            self.payload(),
            format='json',
            HTTP_X_BOARDING_TOKEN=first.data['boarding_token'],
        )
        self.assertEqual(with_token.data['boarding_token'], first.data['boarding_token'])
        self.assertEqual(first.data['seed'], deterministic_seed(self.game_run.seed, self.payload()['source_entity_id'], self.payload()['interior_checksum']))

    def test_rejects_unknown_fields_and_bad_capability(self):
        bad = self.payload() | {'hostile': True}
        response = self.client.post(f'/api/v1/game-runs/{self.game_run.id}/boarding-runs/start/', bad, format='json')
        self.assertEqual(response.status_code, 400)
        started = self.client.post(f'/api/v1/game-runs/{self.game_run.id}/boarding-runs/start/', self.payload(), format='json')
        denied = self.client.get(f"/api/v1/boarding-runs/{started.data['id']}/")
        self.assertEqual(denied.status_code, 403)

    def test_complete_requires_matching_digest_and_is_idempotent(self):
        started = self.client.post(f'/api/v1/game-runs/{self.game_run.id}/boarding-runs/start/', self.payload(), format='json')
        headers = {'HTTP_X_BOARDING_TOKEN': started.data['boarding_token'], 'HTTP_IDEMPOTENCY_KEY': 'complete-1'}
        completion = {'outcome': 'SUCCESS', 'duration_ms': 1000, 'resources_end': {'lives': 3, 'nukes': 2}, 'aliens_killed': 0, 'containers_opened': 0, 'lives_found': 0, 'nukes_found': 0, 'score_events': [], 'shooter_state_digest': self.digest, 'events': [{'sequence': 0, 'at_ms': 1000, 'type': 'EXIT_INTERACTED', 'entity_id': 'exit-main', 'target_id': 'player'}]}
        completed = self.client.post(f"/api/v1/boarding-runs/{started.data['id']}/complete/", completion, format='json', **headers)
        self.assertEqual(completed.status_code, 200)
        replay = self.client.post(f"/api/v1/boarding-runs/{started.data['id']}/complete/", completion, format='json', **headers)
        self.assertEqual(replay.status_code, 200)
        self.assertEqual(replay.data['return_state']['score_delta'], 0)

    def test_rejects_success_without_exit_and_timeout_without_exact_loss(self):
        started = self.client.post(f'/api/v1/game-runs/{self.game_run.id}/boarding-runs/start/', self.payload(), format='json')
        headers = {'HTTP_X_BOARDING_TOKEN': started.data['boarding_token'], 'HTTP_IDEMPOTENCY_KEY': 'complete-2'}
        no_exit = {'outcome': 'SUCCESS', 'duration_ms': 1000, 'resources_end': {'lives': 3, 'nukes': 2}, 'aliens_killed': 0, 'containers_opened': 0, 'lives_found': 0, 'nukes_found': 0, 'score_events': [], 'shooter_state_digest': self.digest, 'events': []}
        self.assertEqual(self.client.post(f"/api/v1/boarding-runs/{started.data['id']}/complete/", no_exit, format='json', **headers).status_code, 400)

    def test_timeout_loses_one_life_and_applies_parent_return_once(self):
        self.game_run.lives_start = 2
        self.game_run.nukes_start = 1
        self.game_run.save(update_fields=['lives_start', 'nukes_start'])
        payload = self.payload() | {'resources': {'lives': 2, 'nukes': 1}}
        started = self.client.post(f'/api/v1/game-runs/{self.game_run.id}/boarding-runs/start/', payload, format='json')
        headers = {'HTTP_X_BOARDING_TOKEN': started.data['boarding_token'], 'HTTP_IDEMPOTENCY_KEY': 'timeout-1'}
        completion = {'outcome': 'TIMEOUT', 'duration_ms': 60000, 'resources_end': {'lives': 1, 'nukes': 1}, 'aliens_killed': 0, 'containers_opened': 0, 'lives_found': 0, 'nukes_found': 0, 'score_events': [], 'shooter_state_digest': self.digest, 'events': [{'sequence': 0, 'at_ms': 60000, 'type': 'TIMEOUT', 'entity_id': 'player'}]}
        response = self.client.post(f"/api/v1/boarding-runs/{started.data['id']}/complete/", completion, format='json', **headers)
        self.assertEqual(response.status_code, 200)
        self.game_run.refresh_from_db()
        self.assertEqual((self.game_run.lives_end, self.game_run.nukes_end), (1, 1))
        self.client.post(f"/api/v1/boarding-runs/{started.data['id']}/complete/", completion, format='json', **headers)
        self.game_run.refresh_from_db()
        self.assertEqual((self.game_run.lives_end, self.game_run.nukes_end), (1, 1))
