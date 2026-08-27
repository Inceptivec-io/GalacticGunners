import hashlib
import json
import re

from rest_framework import serializers
from .authoring import validate_authoring_document


PROHIBITED_KEYS = {'__proto__', 'constructor', 'prototype'}
PROHIBITED_TEXT = ('<script', 'javascript:', 'eval(', 'process.', 'require(', 'select ', 'insert ', 'delete ', 'drop ')
KNOWN_ENEMIES = {'scout', 'cruiser', 'destroyer', 'mothership'}
KNOWN_PICKUPS = {'nuke', 'life'}
KNOWN_HAZARDS = {'asteroid', 'comet'}


def canonical_json(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True)


def checksum(value):
    return hashlib.sha256(canonical_json(value).encode('ascii')).hexdigest()


def validate_definition(value):
    if not isinstance(value, dict):
        raise serializers.ValidationError('Level definition must be an object.')
    encoded = canonical_json(value)
    if len(encoded) > 100_000 or any(term in encoded.lower() for term in PROHIBITED_TEXT):
        raise serializers.ValidationError('Level definition contains prohibited content.')
    if any(key in value for key in PROHIBITED_KEYS):
        raise serializers.ValidationError('Level definition contains prohibited keys.')
    if value.get('schema_version') == '1.1':
        errors = validate_authoring_document(value)
        if errors:
            raise serializers.ValidationError({'code': 'LEVEL_DEFINITION_INVALID', 'detail': 'Level definition failed validation.', 'errors': errors})
        return value
    level = value.get('level', value)
    if value.get('schema_version') != '1.0' or not isinstance(level, dict):
        raise serializers.ValidationError('Unsupported level definition schema.')
    slug = level.get('slug') or value.get('slug')
    if not isinstance(slug, str) or not slug or len(slug) > 64:
        raise serializers.ValidationError('Level definition requires a valid slug.')
    for formation in value.get('enemy_formations', []):
        if formation.get('type', 'scout') not in KNOWN_ENEMIES:
            raise serializers.ValidationError('Unknown enemy type.')
    for rule in value.get('drop_tables', []):
        for entry in rule.get('entries', []):
            if entry.get('pickup') not in KNOWN_PICKUPS:
                raise serializers.ValidationError('Unknown pickup type.')
    for hazard in value.get('hazards', []):
        if (
            hazard.get('type') not in KNOWN_HAZARDS
            or not isinstance(hazard.get('count'), int)
            or not 1 <= hazard['count'] <= 12
            or not isinstance(hazard.get('speed'), (int, float))
            or hazard['speed'] <= 0
        ):
            raise serializers.ValidationError('Invalid hazard definition.')
    anchors = value.get('boarding_anchors', [])
    if not isinstance(anchors, list) or len(anchors) > 1:
        raise serializers.ValidationError('A level may have at most one Boarding anchor.')
    for anchor in anchors:
        selector = anchor.get('source_selector', {})
        expected_id = f"{slug}:formation-{selector.get('formation_index')}:r{selector.get('row')}:c{selector.get('column')}"
        selected = (value.get('enemy_formations') or [])[selector.get('formation_index', -1)] if isinstance(selector.get('formation_index'), int) and 0 <= selector.get('formation_index') < len(value.get('enemy_formations', [])) else {}
        interior = anchor.get('interior', {})
        if (
            anchor.get('source_entity_type') != 'scout'
            or anchor.get('source_ship_type') != 'ALIEN_FRIGATE'
            or (anchor.get('source_entity_id') != expected_id and anchor.get('source_entity_id') != selected.get('entity_id'))
            or anchor.get('offer_duration_ms') != 8000
            or anchor.get('entry_envelope') != {'width_px': 160, 'height_px': 128}
            or not isinstance(interior.get('checksum'), str)
            or not re.fullmatch(r'[0-9a-f]{64}', interior['checksum'])
        ):
            raise serializers.ValidationError('Invalid Boarding anchor.')
    return value
