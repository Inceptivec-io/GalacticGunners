import copy
import json
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from campaigns.models import Campaign, CampaignEntry, CampaignVersion
from games.models import GameProject, GameRelease, Lifecycle, OwnerScope, Visibility
from game_runs.models import GameVersion
from levels.models import Level, LevelVersion


class Command(BaseCommand):
    help = 'Seed the published campaign authority required for local Docker preview.'

    def handle(self, *args, **options):
        user_model = get_user_model()
        system_user, created = user_model.objects.get_or_create(
            username='platform-system',
            defaults={'is_active': False},
        )
        if created:
            system_user.set_unusable_password()
            system_user.save(update_fields=['password'])
        core_project, _ = GameProject.objects.get_or_create(
            slug='galactic-gunners-core',
            owner_scope=OwnerScope.CORE,
            organization=None,
            owner_user=None,
            defaults={
                'name': 'Galactic Gunners CORE',
                'visibility': Visibility.PRIVATE,
                'created_by': system_user,
            },
        )
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
                game_project=core_project,
                defaults={'name': f'Level {sequence}', 'sequence': sequence},
            )
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
            if sequence == 4:
                config['boarding_anchors'] = [{
                    'id': 'level-04-alien-frigate-01',
                    'source_selector': {'formation_index': 0, 'row': 0, 'column': 14},
                    'source_entity_type': 'scout',
                    'source_ship_type': 'ALIEN_FRIGATE',
                    'source_entity_id': 'level-04:formation-0:r0:c14',
                    'interior': {
                        'slug': 'alien-frigate', 'version': 1,
                        'checksum': 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3',
                    },
                    'entry_envelope': {'width_px': 160, 'height_px': 128},
                    'offer_duration_ms': 8000,
                }]

            if level.active_version_id:
                if sequence != 4 or level.active_version.config.get('boarding_anchors') == config.get('boarding_anchors'):
                    continue
                next_version = level.versions.order_by('-version').first().version + 1
                version = LevelVersion.objects.create(level=level, version=next_version, config=config)
                version.status = LevelVersion.Status.VALIDATED
                version.save()
                version.publish()
                continue

            version = LevelVersion.objects.create(level=level, version=1, config=config)
            version.status = LevelVersion.Status.VALIDATED
            version.save()
            version.publish()

        levels = list(Level.objects.filter(game_project=core_project, slug__in=[f'level-{sequence:02d}' for sequence in range(1, 7)]).select_related('active_version').order_by('sequence'))
        if len(levels) != 6 or any(level.active_version is None for level in levels):
            raise RuntimeError('The CORE campaign requires six published active level versions.')

        campaign, _ = Campaign.objects.get_or_create(
            game_project=core_project,
            slug='final-assault',
            defaults={'name': 'Final Assault', 'created_by': system_user},
        )
        campaign_version = campaign.versions.filter(lifecycle=Lifecycle.PUBLISHED).first()
        if campaign_version is None:
            campaign_version = CampaignVersion.objects.create(campaign=campaign, version=1, created_by=system_user)
            for position, level in enumerate(levels, start=1):
                CampaignEntry.objects.create(campaign_version=campaign_version, position=position, level_version=level.active_version)
            campaign_version.lifecycle = Lifecycle.PUBLISHED
            campaign_version.published_by = system_user
            campaign_version.published_at = timezone.now()
            campaign_version.save()

        manifest = {
            'campaign_version_id': str(campaign_version.id),
            'campaign_checksum': campaign_version.checksum,
            'entries': [entry.manifest() for entry in campaign_version.entries.order_by('position')],
        }
        release, created = GameRelease.objects.get_or_create(
            game_project=core_project,
            version='h015-core-v1',
            defaults={'manifest': manifest, 'status': Lifecycle.PUBLISHED, 'created_by': system_user, 'published_by': system_user, 'published_at': timezone.now()},
        )
        if not created and release.status != Lifecycle.PUBLISHED:
            release.manifest = manifest
            release.status = Lifecycle.PUBLISHED
            release.published_by = system_user
            release.published_at = timezone.now()
            release.save()
        self.stdout.write(self.style.SUCCESS('Seeded six-entry published CORE campaign authority.'))
