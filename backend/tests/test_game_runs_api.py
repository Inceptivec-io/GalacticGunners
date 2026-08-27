import json
from pathlib import Path

import pytest
from django.utils import timezone

from accounts.models import User
from game_runs.models import GameRun, GameVersion, ScoreSubmission
from leaderboard.models import LeaderboardEntry
from levels.models import Level, LevelVersion
from players.models import PlayerProfile


def golden_level():
    return json.loads((Path(__file__).parents[1] / 'levels' / 'fixtures' / 'level-01.json').read_text(encoding='utf-8'))


def published_level():
    level = Level.objects.create(slug='level-01', name='Level 1', sequence=1)
    version = LevelVersion.objects.create(level=level, version=1, config=golden_level())
    version.status = LevelVersion.Status.VALIDATED
    version.save()
    version.publish()
    return level, version


def start_payload(version):
    return {'game_version': '1.0.0-dev', 'client_type': 'web', 'level_slug': 'level-01', 'level_version': 1, 'level_checksum': version.checksum, 'seed': 11001}


def valid_completion(*, score=25, summary=None):
    summary = summary or {'scout_kills': 1, 'levels_completed': [1], 'nuke_uses': 0, 'nuke_pickups': 0}
    return {'duration_ms': 5000, 'victory': False, 'level_reached': 1, 'score': score, 'lives_end': 3, 'nukes_end': 2, 'event_summary': summary}


@pytest.mark.django_db
def test_start_resolves_authoritative_level_and_returns_active_contract(client):
    GameVersion.objects.create(version='1.0.0-dev')
    _, version = published_level()
    response = client.post('/api/v1/game-runs/', start_payload(version), content_type='application/json')
    assert response.status_code == 201
    assert response.json()['validation_state'] == 'ACTIVE'
    assert response.json()['level']['checksum'] == version.checksum


@pytest.mark.django_db
def test_rejects_arithmetic_tampering_and_keeps_authoritative_evidence(client):
    GameVersion.objects.create(version='1.0.0-dev')
    _, version = published_level()
    started = client.post('/api/v1/game-runs/', start_payload(version), content_type='application/json').json()
    response = client.post(f"/api/v1/game-runs/{started['id']}/complete/", valid_completion(score=999), content_type='application/json')
    assert response.status_code == 200
    assert response.json()['validation_state'] == 'REJECTED'
    assert response.json()['validated_score'] is None
    assert 'SCORE_ARITHMETIC_MISMATCH' in response.json()['rejection_codes']
    assert ScoreSubmission.objects.get().accepted_score is None


@pytest.mark.django_db
def test_accepts_reconstructed_score_once_and_publishes_authenticated_player(client):
    GameVersion.objects.create(version='1.0.0-dev')
    _, version = published_level()
    user = User.objects.create_user(username='pilot', password='safe-password')
    PlayerProfile.objects.create(user=user, display_name='STARFIRE')
    client.force_login(user)
    started = client.post('/api/v1/game-runs/', start_payload(version), content_type='application/json').json()
    response = client.post(f"/api/v1/game-runs/{started['id']}/complete/", valid_completion(), content_type='application/json')
    assert response.status_code == 200
    assert response.json()['validation_state'] == 'VALIDATED'
    assert response.json()['validated_score'] == 25
    assert response.json()['leaderboard_eligible'] is True
    assert LeaderboardEntry.objects.get().display_name == 'STARFIRE'
    duplicate = client.post(f"/api/v1/game-runs/{started['id']}/complete/", valid_completion(), content_type='application/json')
    assert duplicate.status_code == 409


@pytest.mark.django_db
@pytest.mark.parametrize('summary, code', [
    ({'scout_kills': 9999, 'levels_completed': [1], 'nuke_uses': 0, 'nuke_pickups': 0}, 'IMPOSSIBLE_EVENT_COUNT'),
    ({'scout_kills': 1, 'levels_completed': [2], 'nuke_uses': 0, 'nuke_pickups': 0}, 'CAMPAIGN_SEQUENCE_INVALID'),
    ({'scout_kills': 1, 'levels_completed': [1], 'nuke_uses': 3, 'nuke_pickups': 0}, 'NUKE_STATE_INVALID'),
])
def test_hostile_event_summaries_are_rejected(client, summary, code):
    GameVersion.objects.create(version='1.0.0-dev')
    _, version = published_level()
    started = client.post('/api/v1/game-runs/', start_payload(version), content_type='application/json').json()
    score = max(0, summary.get('scout_kills', 0) * 25)
    response = client.post(f"/api/v1/game-runs/{started['id']}/complete/", valid_completion(score=score, summary=summary), content_type='application/json')
    assert response.status_code == 200
    assert code in response.json()['rejection_codes']


@pytest.mark.django_db
def test_public_leaderboard_exposes_only_minimum_validated_data(client):
    version = GameVersion.objects.create(version='1.0.0-dev')
    run = GameRun.objects.create(game_version=version, client_type='web', score=100, validity='valid', completed_at=timezone.now())
    LeaderboardEntry.objects.create(run=run, score=100, display_name='GUEST')
    response = client.get('/api/v1/leaderboard/')
    assert response.status_code == 200
    assert response.json()['total'] == 1
    assert set(response.json()['results'][0]) == {'rank', 'run_id', 'display_name', 'score', 'campaign_level_reached', 'victory', 'accepted_at'}
