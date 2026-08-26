import pytest
from django.utils import timezone

from accounts.models import User
from game_runs.models import GameRun, GameVersion
from leaderboard.models import LeaderboardEntry, ModerationAuditEvent
from players.models import PlayerProfile


def published_entry(*, user, score, level=1):
    version, _ = GameVersion.objects.get_or_create(version='1.0.0-dev')
    run = GameRun.objects.create(player=user, game_version=version, client_type='web', score=score, level_reached=str(level), validity='valid', completed_at=timezone.now())
    return LeaderboardEntry.objects.create(run=run, score=score, display_name=user.player_profile.display_name, campaign_level_reached=level)


@pytest.mark.django_db
def test_public_ranking_is_deterministic_and_one_best_run_per_player(client):
    alpha = User.objects.create_user(username='alpha', password='safe-password')
    bravo = User.objects.create_user(username='bravo', password='safe-password')
    PlayerProfile.objects.create(user=alpha, display_name='ALPHA')
    PlayerProfile.objects.create(user=bravo, display_name='BRAVO')
    published_entry(user=alpha, score=100, level=1)
    published_entry(user=alpha, score=200, level=1)
    published_entry(user=bravo, score=200, level=2)
    response = client.get('/api/v1/leaderboard/')
    assert response.status_code == 200
    rows = response.json()['results']
    assert [(row['display_name'], row['rank']) for row in rows] == [('BRAVO', 1), ('ALPHA', 2)]


@pytest.mark.django_db
def test_moderation_requires_permission_and_audits_suppression(client):
    player = User.objects.create_user(username='player', password='safe-password')
    PlayerProfile.objects.create(user=player, display_name='PILOT')
    entry = published_entry(user=player, score=100)
    denied = client.post(f'/api/v1/admin/leaderboard/entries/{entry.id}/suppress/', {'reason': 'CHEAT_SUSPECTED'}, content_type='application/json')
    assert denied.status_code == 403
    moderator = User.objects.create_superuser(username='moderator', password='safe-password', email='moderator@example.test')
    client.force_login(moderator)
    response = client.post(f'/api/v1/admin/leaderboard/entries/{entry.id}/suppress/', {'reason': 'CHEAT_SUSPECTED'}, content_type='application/json')
    assert response.status_code == 200 and response.json()['visible'] is False
    assert ModerationAuditEvent.objects.filter(action='entry_suppress').exists()
    assert client.get('/api/v1/leaderboard/').json()['total'] == 0
    restored = client.post(f'/api/v1/admin/leaderboard/entries/{entry.id}/restore/', {'reason': 'DATA_CORRECTION'}, content_type='application/json')
    assert restored.status_code == 200 and restored.json()['visible'] is True


@pytest.mark.django_db
def test_player_suppression_preserves_runs_but_hides_entries(client):
    player = User.objects.create_user(username='player', password='safe-password')
    profile = PlayerProfile.objects.create(user=player, display_name='PILOT')
    entry = published_entry(user=player, score=100)
    moderator = User.objects.create_superuser(username='moderator', password='safe-password', email='moderator@example.test')
    client.force_login(moderator)
    response = client.post(f'/api/v1/admin/leaderboard/players/{profile.id}/suppress/', {'reason': 'ABUSE'}, content_type='application/json')
    assert response.status_code == 200
    entry.refresh_from_db()
    assert entry.visible is False
    assert GameRun.objects.filter(pk=entry.run_id).exists()
