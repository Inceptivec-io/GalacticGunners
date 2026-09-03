import json
from pathlib import Path

from levels.authoring import (
    blank_authoring_document,
    migrate_v1_to_v11,
    validate_authoring_document,
)
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


def test_migration_does_not_silently_rewrite_invalid_current_documents():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['seed'] = -1

    migrated = migrate_v1_to_v11(document)

    assert migrated == document
    assert 'INVALID_LEVEL_METADATA' in {error['code'] for error in validate_authoring_document(migrated)}


def test_blank_document_is_playable_authoring_surface_without_placeholder_hostiles():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    assert document['entities'] == []
    assert document['formations'] == []
    assert len(document['player_spawns']) == 2
    assert validate_authoring_document(document) == []


def test_authoring_document_requires_valid_level_metadata():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    assert validate_authoring_document(document) == []

    document['slug'] = 'Invalid slug!'
    document['name'] = ''
    document['sequence'] = 0
    document['seed'] = -1

    assert 'INVALID_LEVEL_METADATA' in {
        error['code'] for error in validate_authoring_document(document)
    }


def test_authoring_document_requires_governed_canvas_geometry_and_background():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    assert validate_authoring_document(document) == []

    document['canvas'].update({'width': 1279, 'height': 719, 'grid_size': 12, 'background_asset_id': 'background.unknown'})

    assert {'INVALID_CANVAS', 'UNKNOWN_BACKGROUND_ASSET'} <= {
        error['code'] for error in validate_authoring_document(document)
    }


def test_authoring_document_requires_one_enabled_slot_one_player_spawn_in_bounds():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    assert validate_authoring_document(document) == []

    document['player_spawns'][0].update({'slot': 2, 'x': 1281})
    document['player_spawns'][1].update({'enabled': True})

    assert 'PLAYER_SPAWN_CARDINALITY' in {
        error['code'] for error in validate_authoring_document(document)
    }
    assert 'INVALID_PLAYER_SPAWN' in {
        error['code'] for error in validate_authoring_document(document)
    }


def test_authoring_document_requires_typed_entity_asset_geometry_and_profile():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    scout = {
        'id': 'scout-1', 'entity_type': 'SCOUT', 'asset_id': 'enemy.scout',
        'x': 640, 'y': 128, 'width': 44, 'height': 58, 'rotation': 0,
        'z_index': 4, 'behaviour_profile': 'enemy.scout.standard', 'enabled': True,
        'tags': [],
    }
    document['entities'] = [scout]
    assert validate_authoring_document(document) == []

    document['entities'][0].update({
        'asset_id': 'enemy.mothership', 'x': -1, 'width': 0,
        'behaviour_profile': 'enemy.mothership.boss',
    })
    assert 'INVALID_ENTITY' in {
        error['code'] for error in validate_authoring_document(document)
    }


def test_authoring_document_requires_valid_ship_formation_members_and_bounds():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['entities'] = [
        {'id': 'scout-1', 'entity_type': 'SCOUT', 'asset_id': 'enemy.scout', 'x': 320, 'y': 128, 'width': 44, 'height': 58, 'rotation': 0, 'z_index': 4, 'behaviour_profile': 'enemy.scout.standard', 'enabled': True, 'tags': []},
        {'id': 'cruiser-1', 'entity_type': 'CRUISER', 'asset_id': 'enemy.cruiser', 'x': 448, 'y': 128, 'width': 58, 'height': 62, 'rotation': 0, 'z_index': 4, 'behaviour_profile': 'enemy.cruiser.standard', 'enabled': True, 'tags': []},
    ]
    document['formations'] = [{'id': 'formation-1', 'name': 'Opening wave', 'layout': 'LINE', 'bounds': {'x': 256, 'y': 96, 'width': 256, 'height': 96}, 'member_ids': ['scout-1', 'cruiser-1'], 'motion_profile': 'formation.standard', 'entry_delay_ms': 0, 'repeat': 0}]
    assert validate_authoring_document(document) == []

    document['formations'][0].update({'layout': 'INVALID', 'member_ids': ['scout-1', 'scout-1'], 'bounds': {'x': 1200, 'y': 700, 'width': 128, 'height': 64}})
    assert 'UNKNOWN_ENTITY_REFERENCE' in {
        error['code'] for error in validate_authoring_document(document)
    }


def test_authoring_document_requires_destructible_shield_tile_matrices():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['shield_structures'] = [{
        'id': 'shield-1', 'name': 'Bunker 1', 'origin': {'x': 96, 'y': 520},
        'tile_asset_id': 'shield.tile', 'tile_width': 10, 'tile_height': 10,
        'matrix': [[1, 1, 1], [1, 0, 1]], 'destructible': True,
    }]
    assert validate_authoring_document(document) == []

    document['shield_structures'][0].update({'tile_asset_id': 'enemy.scout', 'matrix': [[1, 2]], 'destructible': False})
    assert 'INVALID_SHIELD_MATRIX' in {
        error['code'] for error in validate_authoring_document(document)
    }


def test_authoring_document_requires_bounded_supported_pickup_drop_rules():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['drop_rules'] = [{
        'id': 'nuke-drop', 'host_entity_types': ['SCOUT', 'CRUISER'],
        'pickup_type': 'NUKE', 'probability': 0.25, 'maximum_per_level': 2,
    }]
    assert validate_authoring_document(document) == []

    document['drop_rules'][0].update({'host_entity_types': ['MOTHERSHIP'], 'probability': 1.1, 'maximum_per_level': -1})
    assert 'INVALID_DROP_RULE' in {
        error['code'] for error in validate_authoring_document(document)
    }


def test_authoring_document_requires_valid_objectives_and_target_references():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['entities'] = [{'id': 'scout-1', 'entity_type': 'SCOUT', 'asset_id': 'enemy.scout', 'x': 640, 'y': 128, 'width': 44, 'height': 58, 'rotation': 0, 'z_index': 4, 'behaviour_profile': 'enemy.scout.standard', 'enabled': True, 'tags': []}]
    document['objectives'] = [{'id': 'clear-scout', 'type': 'DESTROY_ALL_HOSTILES', 'required': True, 'target_entity_ids': ['scout-1'], 'duration_ms': None}]
    assert validate_authoring_document(document) == []

    document['objectives'][0].update({'type': 'SURVIVE_DURATION', 'target_entity_ids': ['missing'], 'duration_ms': 0})
    assert 'INVALID_OBJECTIVE' in {
        error['code'] for error in validate_authoring_document(document)
    }


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


def test_authoring_document_accepts_magnitude_only_seeded_asteroid_spin():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['hazard_emitters'] = [{
        'id': 'asteroid-emitter', 'hazard_type': 'ASTEROID', 'asset_id': 'hazard.asteroid', 'enabled': True,
        'variant_mode': 'ORDERED', 'variant_ids': ['ASTEROID_VARIANT_01', 'ASTEROID_VARIANT_03'],
        'initial_count': 1, 'maximum_active': 2, 'spawn_interval_ms': 3000, 'spawn_jitter_ms': 250,
        'speed_min': 90, 'speed_max': 140, 'angular_velocity_min': 40, 'angular_velocity_max': 80,
        'spin_direction_policy': 'SEEDED_BIDIRECTIONAL',
        'entry_edges': ['LEFT', 'RIGHT'], 'spawn_pattern': 'ALTERNATING_EDGES', 'spawn_points': [],
        'despawn_margin': 64, 'collision_damage': 1,
    }]
    assert validate_authoring_document(document) == []


def test_authoring_document_rejects_invalid_hazard_variant_pools():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['hazard_emitters'] = [{
        'id': 'asteroid-emitter', 'hazard_type': 'ASTEROID', 'asset_id': 'hazard.asteroid', 'enabled': True,
        'variant_mode': 'SEEDED_RANDOM', 'variant_ids': ['COMET_VARIANT_01'],
        'initial_count': 1, 'maximum_active': 2, 'spawn_interval_ms': 3000, 'spawn_jitter_ms': 0,
        'speed_min': 90, 'speed_max': 140, 'angular_velocity_min': 40, 'angular_velocity_max': 80,
        'spin_direction_policy': 'SEEDED_BIDIRECTIONAL',
        'entry_edges': ['LEFT', 'RIGHT'], 'spawn_pattern': 'ALTERNATING_EDGES', 'spawn_points': [],
        'despawn_margin': 64, 'collision_damage': 1,
    }]
    assert 'INVALID_EMITTER' in {error['code'] for error in validate_authoring_document(document)}
    document['hazard_emitters'][0]['variant_ids'] = ['ASTEROID_VARIANT_01', 'ASTEROID_VARIANT_01']
    assert 'INVALID_EMITTER' in {error['code'] for error in validate_authoring_document(document)}
    document['hazard_emitters'][0].update({'variant_mode': 'FIXED', 'variant_ids': []})
    assert 'INVALID_EMITTER' in {error['code'] for error in validate_authoring_document(document)}


def test_authoring_document_rejects_cross_zero_or_zero_asteroid_spin_contracts():
    document = blank_authoring_document(identifier='map-01', slug='map-01', name='Blank Map', sequence=1, seed=77)
    document['hazard_emitters'] = [{
        'id': 'asteroid-emitter', 'hazard_type': 'ASTEROID', 'asset_id': 'hazard.asteroid', 'enabled': True,
        'variant_mode': 'ORDERED', 'variant_ids': ['ASTEROID_VARIANT_01'],
        'initial_count': 1, 'maximum_active': 2, 'spawn_interval_ms': 3000, 'spawn_jitter_ms': 0,
        'speed_min': 90, 'speed_max': 140, 'angular_velocity_min': -80, 'angular_velocity_max': 80,
        'spin_direction_policy': 'SEEDED_BIDIRECTIONAL', 'entry_edges': ['LEFT', 'RIGHT'],
        'spawn_pattern': 'ALTERNATING_EDGES', 'spawn_points': [], 'despawn_margin': 64, 'collision_damage': 1,
    }]
    assert 'INVALID_EMITTER' in {error['code'] for error in validate_authoring_document(document)}
    document['hazard_emitters'][0].update({'angular_velocity_min': 0, 'angular_velocity_max': 80})
    assert 'INVALID_EMITTER' in {error['code'] for error in validate_authoring_document(document)}


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
