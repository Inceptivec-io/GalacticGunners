import hashlib
import json
import secrets

from django.utils.crypto import constant_time_compare


def canonical_json(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True)


def digest(value):
    return hashlib.sha256(canonical_json(value).encode('ascii')).hexdigest()


def new_capability_token():
    return secrets.token_urlsafe(32)


def token_digest(token):
    return hashlib.sha256(token.encode('ascii')).hexdigest()


def token_matches(token, expected_digest):
    return bool(token and expected_digest and constant_time_compare(token_digest(token), expected_digest))


def deterministic_seed(game_run_seed, source_entity_id, interior_checksum):
    material = f'{game_run_seed}:{source_entity_id}:{interior_checksum}'.encode('ascii')
    return int.from_bytes(hashlib.sha256(material).digest()[:4], 'big')
