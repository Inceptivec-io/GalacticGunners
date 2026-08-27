import hashlib
import json
from pathlib import Path

from django.db import migrations
from django.utils import timezone


INTERIOR_CHECKSUM = 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3'


def canonical_checksum(value):
    encoded = json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True)
    return hashlib.sha256(encoded.encode('ascii')).hexdigest()


def seed_alien_frigate(apps, _schema_editor):
    Interior = apps.get_model('boarding', 'Interior')
    InteriorVersion = apps.get_model('boarding', 'InteriorVersion')
    fixture_path = Path(__file__).resolve().parents[1] / 'fixtures' / 'interior-alien-frigate-v1.json'
    definition = json.loads(fixture_path.read_text(encoding='utf-8'))
    if canonical_checksum(definition) != INTERIOR_CHECKSUM:
        raise RuntimeError('Alien frigate fixture checksum does not match H014 authority.')
    interior, created = Interior.objects.get_or_create(
        slug='alien-frigate',
        defaults={'name': 'Alien Frigate', 'ship_type': 'ALIEN_FRIGATE'},
    )
    version, version_created = InteriorVersion.objects.get_or_create(
        interior=interior,
        version=1,
        defaults={
            'definition': definition,
            'checksum': INTERIOR_CHECKSUM,
            'status': 'PUBLISHED',
            'published_at': timezone.now(),
        },
    )
    if not version_created and (version.checksum != INTERIOR_CHECKSUM or version.definition != definition):
        raise RuntimeError('Existing alien frigate v1 conflicts with H014 authority.')
    if version.status != 'PUBLISHED':
        version.status = 'PUBLISHED'
        version.published_at = version.published_at or timezone.now()
        version.save(update_fields=['status', 'published_at'])
    if interior.active_version_id and interior.active_version_id != version.id:
        raise RuntimeError('Existing alien frigate active version conflicts with H014 authority.')
    if interior.active_version_id != version.id:
        interior.active_version_id = version.id
        interior.save(update_fields=['active_version'])


class Migration(migrations.Migration):
    dependencies = [('boarding', '0001_initial')]
    operations = [migrations.RunPython(seed_alien_frigate, migrations.RunPython.noop)]
