import copy
import json
from pathlib import Path

from django.core.management.base import BaseCommand

from game_runs.models import GameVersion
from levels.models import Level, LevelVersion


class Command(BaseCommand):
    help = 'Seed the published campaign authority required for local Docker preview.'

    def handle(self, *args, **options):
        game_version, _ = GameVersion.objects.get_or_create(
            version='v1.0-s001-l1-slice',
            defaults={'is_active': True},
        )
        if not game_version.is_active:
            game_version.is_active = True
            game_version.save(update_fields=['is_active'])

        fixture = Path(__file__).resolve().parents[2] / 'fixtures' / 'level-01.json'
        level_one_config = json.loads(fixture.read_text(encoding='utf-8'))

        for sequence in range(1, 7):
            slug = f'level-{sequence:02d}'
            level, _ = Level.objects.get_or_create(
                slug=slug,
                defaults={'name': f'Level {sequence}', 'sequence': sequence},
            )
            if level.active_version_id:
                continue

            config = copy.deepcopy(level_one_config)
            config.update(
                {
                    'id': slug,
                    'name': f'Level {sequence}',
                    'slug': slug,
                    'version': 1,
                    'status': 'PUBLISHED',
                    'sequence': sequence,
                    'seed': 12000 + sequence,
                }
            )
            # Level 1 is the accepted 58-enemy golden baseline. Later levels
            # mirror the deterministic H012 campaign definition progression.
            if sequence > 1:
                config['enemy_formations'][0]['columns'] = min(29, 16 + sequence * 2)

            version = LevelVersion.objects.create(level=level, version=1, config=config)
            version.status = LevelVersion.Status.VALIDATED
            version.save()
            version.publish()

        self.stdout.write(self.style.SUCCESS('Seeded published Level 1-6 runtime authority.'))
