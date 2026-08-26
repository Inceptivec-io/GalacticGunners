import json
from pathlib import Path

from django.core.management.base import BaseCommand

from game_runs.models import GameVersion
from levels.models import Level, LevelVersion


class Command(BaseCommand):
    help = 'Seed the minimal published runtime authority required for local Docker preview.'

    def handle(self, *args, **options):
        GameVersion.objects.get_or_create(
            version='v1.0-s001-l1-slice',
            defaults={'is_active': True},
        )
        level, _ = Level.objects.get_or_create(
            slug='level-01',
            defaults={'name': 'Level 1', 'sequence': 1},
        )
        if level.active_version_id:
            return
        fixture = Path(__file__).resolve().parents[2] / 'fixtures' / 'level-01.json'
        config = json.loads(fixture.read_text(encoding='utf-8'))
        version = LevelVersion.objects.create(level=level, version=1, config=config)
        version.status = LevelVersion.Status.VALIDATED
        version.save()
        version.publish()
        self.stdout.write(self.style.SUCCESS('Seeded published Level 1 runtime authority.'))
