import json
from pathlib import Path

from levels.authoring import blank_authoring_document, migrate_v1_to_v11, validate_authoring_document
from levels.validation import checksum


def legacy_level():
    fixture = Path(__file__).parents[1] / 'fixtures' / 'level-01.json'
    return json.loads(fixture.read_text(encoding='utf-8'))


def test_v10_to_v11_migration_is_deterministic_and_materialises_level_one():
    first = migrate_v1_to_v11(legacy_level())
    second = migrate_v1_to_v11(legacy_level())
    assert first == second
    assert checksum(first) == checksum(second)
    assert first['schema_version'] == '1.1'
    assert len(first['entities']) == 58
    assert sum(sum(row) for shield in first['shield_structures'] for row in shield['matrix']) == 256
    assert validate_authoring_document(first) == []


def test_blank_document_is_playable_authoring_surface_without_placeholder_hostiles():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    assert document['entities'] == []
    assert document['formations'] == []
    assert len(document['player_spawns']) == 2
    assert validate_authoring_document(document) == []


def test_authoring_document_rejects_duplicate_entity_ids_and_unknown_formation_members():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    entity = {'id': 'scout-1', 'entity_type': 'SCOUT', 'asset_id': 'enemy.scout', 'x': 640, 'y': 100, 'width': 44, 'height': 58, 'rotation': 0, 'z_index': 4, 'behaviour_profile': 'enemy.scout.standard', 'enabled': True, 'tags': []}
    document['entities'] = [entity, dict(entity)]
    document['formations'] = [{'id': 'formation-1', 'name': 'Invalid', 'layout': 'FREEFORM', 'bounds': {'x': 0, 'y': 0, 'width': 100, 'height': 100}, 'member_ids': ['missing'], 'motion_profile': 'formation.standard', 'entry_delay_ms': 0, 'repeat': 0}]
    codes = {error['code'] for error in validate_authoring_document(document)}
    assert 'DUPLICATE_OR_INVALID_ENTITY_ID' in codes
    assert 'UNKNOWN_ENTITY_REFERENCE' in codes


def test_authoring_document_rejects_out_of_bounds_objects_emitters_and_runtime_budget_overruns():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['entities'] = [{
        'id': 'boss', 'entity_type': 'MOTHERSHIP', 'asset_id': 'enemy.mothership', 'x': 1270, 'y': 80,
        'width': 260, 'height': 120, 'rotation': 0, 'z_index': 4, 'behaviour_profile': 'enemy.mothership.boss', 'enabled': True, 'tags': [],
    }]
    document['hazard_emitters'] = [{
        'id': 'bad-emitter', 'hazard_type': 'ASTEROID', 'asset_id': 'hazard.asteroid', 'enabled': True,
        'initial_count': 2, 'maximum_active': 1, 'spawn_interval_ms': 0, 'spawn_jitter_ms': 0,
        'speed_min': 120, 'speed_max': 60, 'angular_velocity_min': 0, 'angular_velocity_max': 1,
        'entry_edges': ['INVALID'], 'spawn_pattern': 'RANDOM_EDGE', 'spawn_points': [], 'despawn_margin': 64, 'collision_damage': 1,
    }]
    document['performance_budget']['max_total_runtime_objects'] = 1
    codes = {error['code'] for error in validate_authoring_document(document)}
    assert 'INVALID_ENTITY' in codes
    assert 'INVALID_EMITTER' in codes
    assert 'RUNTIME_OBJECT_BUDGET_EXCEEDED' in codes


def test_authoring_document_accepts_signed_asteroid_spin_range():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['hazard_emitters'] = [{
        'id': 'asteroid-emitter', 'hazard_type': 'ASTEROID', 'asset_id': 'hazard.asteroid', 'enabled': True,
        'initial_count': 1, 'maximum_active': 2, 'spawn_interval_ms': 3000, 'spawn_jitter_ms': 250,
        'speed_min': 90, 'speed_max': 140, 'angular_velocity_min': -80, 'angular_velocity_max': 80,
        'entry_edges': ['LEFT', 'RIGHT'], 'spawn_pattern': 'ALTERNATING_EDGES', 'spawn_points': [],
        'despawn_margin': 64, 'collision_damage': 1,
    }]
    assert validate_authoring_document(document) == []


def test_authoring_document_accepts_legacy_boarding_source_and_rejects_unknown_target():
    document = migrate_v1_to_v11(legacy_level())
    source = document['entities'][0]['id']
    document['boarding_anchors'] = [{
        'id': 'boarding-1', 'source_entity_id': source, 'source_ship_type': 'ALIEN_FRIGATE',
        'interior': {'slug': 'alien-frigate', 'version': 1, 'checksum': 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3'},
        'entry_envelope': {'width_px': 160, 'height_px': 128}, 'offer_duration_ms': 8000, 'interaction': 'BOARD',
    }]
    assert validate_authoring_document(document) == []
    document['boarding_anchors'][0]['source_entity_id'] = 'missing'
    assert 'INVALID_BOARDING_ANCHOR' in {error['code'] for error in validate_authoring_document(document)}
