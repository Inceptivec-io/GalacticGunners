import hashlib
import json

from rest_framework import serializers


PROHIBITED_KEYS = {'__proto__', 'constructor', 'prototype'}
PROHIBITED_TEXT = ('<script', 'javascript:', 'eval(', 'process.', 'require(', 'select ', 'insert ', 'delete ', 'drop ')
KNOWN_ENEMIES = {'scout'}
KNOWN_PICKUPS = {'nuke', 'life'}


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
    return value
