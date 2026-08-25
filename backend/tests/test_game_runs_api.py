import pytest
from django.urls import reverse

from game_runs.models import GameRun, GameVersion
from leaderboard.models import LeaderboardEntry


@pytest.mark.django_db
def test_start_game_run_creates_pending_guest_run(client):
    response = client.post(
        reverse('game-run-start'),
        {'game_version': '1.0.0-dev', 'client_type': 'web'},
        content_type='application/json',
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload['game_version'] == '1.0.0-dev'
    assert payload['client_type'] == 'web'
    assert payload['completed_at'] is None
    assert payload['score'] == 0
    assert payload['validity'] == 'pending'


@pytest.mark.django_db
def test_complete_game_run_publishes_valid_completed_run(client):
    version = GameVersion.objects.create(version='1.0.0-dev')
    run = GameRun.objects.create(game_version=version, client_type=GameRun.ClientType.WEB)

    response = client.post(
        reverse('game-run-complete', kwargs={'run_id': run.id}),
        {
            'claimed_score': 1250,
            'level_reached': 'boss',
            'lives_used': 2,
            'nukes_used': 1,
            'victory': True,
            'event_summary': {'events': 12},
        },
        content_type='application/json',
    )

    assert response.status_code == 200
    run.refresh_from_db()
    assert run.completed_at is not None
    assert run.validity == GameRun.Validity.VALID
    assert run.score == 1250
    assert LeaderboardEntry.objects.get(run=run).score == 1250


@pytest.mark.django_db
def test_duplicate_complete_is_rejected(client):
    version = GameVersion.objects.create(version='1.0.0-dev')
    run = GameRun.objects.create(game_version=version, client_type=GameRun.ClientType.WEB)
    url = reverse('game-run-complete', kwargs={'run_id': run.id})
    payload = {'claimed_score': 10, 'event_summary': {}}

    first = client.post(url, payload, content_type='application/json')
    second = client.post(url, payload, content_type='application/json')

    assert first.status_code == 200
    assert second.status_code == 409
    assert LeaderboardEntry.objects.filter(run=run).count() == 1


@pytest.mark.django_db
def test_unknown_run_returns_404(client):
    response = client.post(
        '/api/v1/game-runs/00000000-0000-0000-0000-000000000000/complete/',
        {'claimed_score': 10, 'event_summary': {}},
        content_type='application/json',
    )

    assert response.status_code == 404


@pytest.mark.django_db
def test_invalid_payload_returns_400(client):
    response = client.post(
        reverse('game-run-start'),
        {'game_version': '', 'client_type': 'console'},
        content_type='application/json',
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_leaderboard_lists_only_valid_published_runs(client):
    version = GameVersion.objects.create(version='1.0.0-dev')
    valid_run = GameRun.objects.create(
        game_version=version,
        client_type=GameRun.ClientType.WEB,
        score=100,
        validity=GameRun.Validity.VALID,
    )
    pending_run = GameRun.objects.create(
        game_version=version,
        client_type=GameRun.ClientType.WEB,
        score=999,
        validity=GameRun.Validity.PENDING,
    )
    LeaderboardEntry.objects.create(run=valid_run, score=100, display_name='GUEST')

    response = client.get(reverse('leaderboard'))
    payload = response.json()

    assert response.status_code == 200
    assert payload['count'] == 1
    assert payload['results'][0]['run_id'] == str(valid_run.id)
    assert not LeaderboardEntry.objects.filter(run=pending_run).exists()


@pytest.mark.django_db
def test_leaderboard_rejects_invalid_query_bounds(client):
    response = client.get(reverse('leaderboard'), {'limit': 'not-a-number'})

    assert response.status_code == 400


@pytest.mark.django_db
def test_model_constraints_reject_negative_values():
    version = GameVersion.objects.create(version='1.0.0-dev')

    with pytest.raises(Exception):
        GameRun.objects.create(
            game_version=version,
            client_type=GameRun.ClientType.WEB,
            score=-1,
        )
