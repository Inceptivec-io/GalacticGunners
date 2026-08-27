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
