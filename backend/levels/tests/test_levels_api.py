import json
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.exceptions import ValidationError

from campaigns.models import CampaignVersion
from campaigns.services import CampaignService
from game_runs.models import GameRun, GameVersion
from games.models import GameProject, OwnerScope, Visibility
from levels.models import Level, LevelAuditEvent, LevelVersion


def golden_level():
    path = Path(__file__).parents[1] / 'fixtures' / 'level-01.json'
    return json.loads(path.read_text(encoding='utf-8'))


@pytest.fixture
def level_admin(django_user_model):
    user = django_user_model.objects.create_user(username='level-admin', password='safe-password')
    user.user_permissions.add(Permission.objects.get(codename='manage_platform'))
    return user


@pytest.fixture
def core_project(level_admin):
    return GameProject.objects.create(
        slug='galactic-gunners-core', name='Galactic Gunners CORE',
        owner_scope=OwnerScope.CORE, visibility=Visibility.PRIVATE, created_by=level_admin,
    )


@pytest.mark.django_db
def test_level_one_admission_publish_and_public_resolution(client, level_admin, core_project):
    assert client.post('/api/v1/admin/levels/', {'slug': 'level-01', 'name': 'Level 1', 'sequence': 1, 'config': golden_level()}, content_type='application/json').status_code == 403
    player = get_user_model().objects.create_user(username='ordinary-player', password='safe-password')
    client.force_login(player)
    assert client.post('/api/v1/admin/levels/', {'slug': 'level-01', 'name': 'Level 1', 'sequence': 1, 'config': golden_level()}, content_type='application/json').status_code == 403
    client.force_login(level_admin)
    created = client.post('/api/v1/admin/levels/', {'slug': 'level-01', 'name': 'Level 1', 'sequence': 1, 'config': golden_level()}, content_type='application/json')
    assert created.status_code == 201
    level = Level.objects.get(slug='level-01')
    validated = client.post(f'/api/v1/admin/levels/{level.id}/validate/', {'version': 1}, content_type='application/json')
    assert validated.status_code == 200
    published = client.post(f'/api/v1/admin/levels/{level.id}/publish/', {'version': 1}, content_type='application/json')
    assert published.status_code == 200
    response = client.get('/api/v1/levels/level-01/')
    assert response.status_code == 200
    assert response.json()['active_version']['checksum'] == LevelVersion.objects.get(level=level, version=1).checksum


@pytest.mark.django_db
def test_privileged_level_actions_create_attributable_append_only_audit_records(client, level_admin, core_project):
    level = Level.objects.create(slug='level-01', name='Level 1', sequence=1, game_project=core_project)
    version = LevelVersion.objects.create(level=level, version=1, config=golden_level())

    assert client.post(f'/api/v1/admin/levels/{level.id}/validate/', {'version': 1}, content_type='application/json').status_code == 403
    assert LevelAuditEvent.objects.count() == 0

    client.force_login(level_admin)
    assert client.post(f'/api/v1/admin/levels/{level.id}/validate/', {'version': 1}, content_type='application/json').status_code == 200
    assert client.post(f'/api/v1/admin/levels/{level.id}/publish/', {'version': 1}, content_type='application/json').status_code == 200

    events = list(LevelAuditEvent.objects.filter(level=level).order_by('created_at'))
    assert [event.action for event in events] == ['validate', 'publish']
    assert all(event.actor_id == level_admin.id and event.version_id == version.id for event in events)
    with pytest.raises(ValidationError):
        events[0].action = 'tampered'
        events[0].save()
    with pytest.raises(ValidationError):
        events[0].delete()


@pytest.mark.django_db
def test_published_version_is_immutable_and_unknown_routes_are_absent(client, level_admin, core_project):
    level = Level.objects.create(slug='level-01', name='Level 1', sequence=1, game_project=core_project)
    version = LevelVersion.objects.create(level=level, version=1, config=golden_level())
    version.status = LevelVersion.Status.VALIDATED
    version.save()
    version.publish()
    version.config['name'] = 'Tampered'
    with pytest.raises(ValidationError):
        version.save()
    assert client.get('/admin/').status_code == 404
    assert client.get('/editor/').status_code == 404


@pytest.mark.django_db
def test_clone_export_and_deterministic_draft_generation(client, level_admin, core_project):
    client.force_login(level_admin)
    level = Level.objects.create(slug='level-01', name='Level 1', sequence=1)
    LevelVersion.objects.create(level=level, version=1, config=golden_level())
    clone = client.post(f'/api/v1/admin/levels/{level.id}/clone/', {}, content_type='application/json')
    assert clone.status_code == 201 and clone.json()['version'] == 2
    exported = client.get(f'/api/v1/admin/levels/{level.id}/export/')
    assert exported.status_code == 200 and len(exported.json()['versions']) == 2
    generated = client.post('/api/v1/admin/levels/generate/', {'slug': 'level-02', 'sequence': 2, 'seed': 12002}, content_type='application/json')
    assert generated.status_code == 201
    draft = Level.objects.get(slug='level-02').versions.get(version=1)
    assert draft.status == LevelVersion.Status.DRAFT
    assert draft.seed_policy == {'seed': 12002}
    assert draft.config['schema_version'] == '1.1'
    assert draft.config['entities'] == []
    assert draft.config['formations'] == []
    assert draft.config['player_spawns'][0]['enabled'] is True


@pytest.mark.django_db
def test_game_run_binds_the_server_owned_published_level_identity(client, level_admin):
    core_project = GameProject.objects.create(
        slug='game-run-core', name='Game Run CORE', owner_scope=OwnerScope.CORE,
        visibility=Visibility.PRIVATE, created_by=level_admin,
    )
    level = Level.objects.create(slug='level-01', name='Level 1', sequence=1, game_project=core_project)
    version = LevelVersion.objects.create(level=level, version=1, config=golden_level())
    version.status = LevelVersion.Status.VALIDATED; version.save(); version.publish()
    GameVersion.objects.create(version='1.0.0-dev')
    response = client.post('/api/v1/game-runs/', {'game_version': '1.0.0-dev', 'client_type': 'web', 'level_slug': 'level-01', 'level_version': 1, 'level_checksum': version.checksum, 'seed': 11001}, content_type='application/json')
    assert response.status_code == 201
    run = GameRun.objects.get(pk=response.json()['id'])
    assert run.level == level and run.level_version == 1 and run.level_checksum == version.checksum and run.seed == 11001


@pytest.mark.django_db
def test_internal_preview_is_bound_to_the_requested_immutable_draft_checksum(client, level_admin):
    level = Level.objects.create(slug='preview-one', name='Preview', sequence=1)
    first = LevelVersion.objects.create(level=level, version=1, config=golden_level())
    changed = golden_level()
    changed['name'] = 'Preview Draft'
    second = LevelVersion.objects.create(level=level, version=2, config=changed, supersedes=first)
    client.force_login(level_admin)
    response = client.get(f'/api/v1/admin/levels/{level.id}/preview/{second.checksum}/')
    assert response.status_code == 200
    assert response.json()['checksum'] == second.checksum
    assert response.json()['config']['name'] == 'Preview Draft'
    assert client.get(f'/api/v1/admin/levels/{level.id}/preview/{first.checksum}x/').status_code == 404


@pytest.mark.django_db
def test_core_publication_creates_immutable_campaign_release_without_mutating_pinned_runs(client, level_admin, core_project):
    levels = []
    for sequence in range(1, 7):
        level = Level.objects.create(slug=f'level-{sequence:02d}', name=f'Level {sequence}', sequence=sequence, game_project=core_project)
        version = LevelVersion.objects.create(level=level, version=1, config=golden_level())
        version.status = LevelVersion.Status.VALIDATED; version.save(); version.publish()
        levels.append(level)
    client.force_login(level_admin)
    first = client.post(f'/api/v1/admin/levels/{levels[-1].id}/publish/', {'version': 1}, content_type='application/json')
    assert first.status_code == 200
    original_run, _ = CampaignService.start(user=level_admin, seed_root=1)
    original_campaign = original_run.campaign_version
    changed = golden_level(); changed['name'] = 'Published changed layout'
    draft = client.post(f'/api/v1/admin/levels/{levels[0].id}/drafts/', {'expected_checksum': levels[0].active_version.checksum, 'config': changed}, content_type='application/json')
    assert draft.status_code == 201
    published = client.post(f'/api/v1/admin/levels/{levels[0].id}/publish/', {'version': draft.json()['version']}, content_type='application/json')
    assert published.status_code == 200 and published.json()['campaign_release_id']
    fresh_run, _ = CampaignService.start(user=level_admin, seed_root=2)
    assert fresh_run.campaign_version_id != original_campaign.id
    assert original_run.campaign_version_id == original_campaign.id
    assert CampaignVersion.objects.filter(campaign=original_campaign.campaign, lifecycle='PUBLISHED').count() == 2


@pytest.mark.django_db
def test_admin_authority_exposes_all_core_revisions_and_active_release(client, level_admin, core_project):
    levels = []
    for sequence in range(1, 7):
        level = Level.objects.create(slug=f'level-{sequence:02d}', name=f'Level {sequence}', sequence=sequence, game_project=core_project)
        version = LevelVersion.objects.create(level=level, version=1, config=golden_level())
        version.status = LevelVersion.Status.VALIDATED; version.save(); version.publish()
        levels.append(level)
    client.force_login(level_admin)
    assert client.post(f'/api/v1/admin/levels/{levels[-1].id}/publish/', {'version': 1}, content_type='application/json').status_code == 200
    changed = golden_level(); changed['name'] = 'Persisted authoring draft'
    assert client.post(f'/api/v1/admin/levels/{levels[0].id}/drafts/', {'expected_checksum': levels[0].active_version.checksum, 'config': changed}, content_type='application/json').status_code == 201
    response = client.get('/api/v1/admin/levels/authority/')
    assert response.status_code == 200
    assert len(response.json()['results']) == 6
    first = response.json()['results'][0]
    assert first['editable_version']['config']['name'] == 'Persisted authoring draft'
    assert len(first['versions']) == 2
    assert response.json()['active_campaign_release']['campaign_version_id']


@pytest.mark.django_db
def test_pinned_campaign_entry_can_start_after_a_newer_level_is_published(client, level_admin, core_project):
    levels = []
    for sequence in range(1, 7):
        level = Level.objects.create(slug=f'level-{sequence:02d}', name=f'Level {sequence}', sequence=sequence, game_project=core_project)
        version = LevelVersion.objects.create(level=level, version=1, config=golden_level())
        version.status = LevelVersion.Status.VALIDATED; version.save(); version.publish()
        levels.append(level)
    client.force_login(level_admin)
    client.post(f'/api/v1/admin/levels/{levels[-1].id}/publish/', {'version': 1}, content_type='application/json')
    pinned, _ = CampaignService.start(user=level_admin, seed_root=1)
    changed = golden_level(); changed['name'] = 'New active level without mutating pinned campaign'
    draft = client.post(f'/api/v1/admin/levels/{levels[0].id}/drafts/', {'expected_checksum': levels[0].active_version.checksum, 'config': changed}, content_type='application/json')
    client.post(f'/api/v1/admin/levels/{levels[0].id}/publish/', {'version': draft.json()['version']}, content_type='application/json')
    GameVersion.objects.create(version='1.0.0-dev')
    entry = pinned.current_entry
    response = client.post('/api/v1/game-runs/', {
        'game_version': '1.0.0-dev', 'client_type': 'web', 'level_slug': entry.level_version.level.slug,
        'level_version': entry.level_version.version, 'level_checksum': entry.level_version.checksum,
        'seed': 1, 'campaign_run_id': str(pinned.id), 'campaign_entry_id': str(entry.id),
    }, content_type='application/json')
    assert response.status_code == 201


@pytest.mark.django_db
def test_superseded_release_history_can_be_restored_as_a_new_immutable_release(client, level_admin, core_project):
    level = Level.objects.create(slug='level-01', name='Level 1', sequence=1, game_project=core_project)
    initial = LevelVersion.objects.create(level=level, version=1, config=golden_level())
    initial.status = LevelVersion.Status.VALIDATED; initial.save(); initial.publish()
    changed = golden_level(); changed['name'] = 'Changed release'
    client.force_login(level_admin)
    draft = client.post(f'/api/v1/admin/levels/{level.id}/drafts/', {'expected_checksum': initial.checksum, 'config': changed}, content_type='application/json')
    assert draft.status_code == 201
    assert client.post(f'/api/v1/admin/levels/{level.id}/publish/', {'version': draft.json()['version']}, content_type='application/json').status_code == 200
    initial.refresh_from_db()
    assert initial.status == LevelVersion.Status.SUPERSEDED
    restored = client.post(f'/api/v1/admin/levels/{level.id}/rollback/', {'version': initial.version}, content_type='application/json')
    assert restored.status_code == 200
    level.refresh_from_db()
    assert level.active_version.config == initial.config
    assert level.active_version.version == 3
