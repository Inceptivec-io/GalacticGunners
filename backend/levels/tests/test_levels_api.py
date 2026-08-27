import json
from pathlib import Path

import pytest
from django.contrib.auth.models import Permission

from levels.models import Level, LevelVersion
from game_runs.models import GameRun, GameVersion
from games.models import GameProject, OwnerScope, Visibility


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
def test_published_version_is_immutable_and_unknown_routes_are_absent(client, level_admin):
    level = Level.objects.create(slug='level-01', name='Level 1', sequence=1, game_project=core_project)
    version = LevelVersion.objects.create(level=level, version=1, config=golden_level())
    version.status = LevelVersion.Status.VALIDATED
    version.save()
    version.publish()
    version.config['name'] = 'Tampered'
    with pytest.raises(Exception):
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
