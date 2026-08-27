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
from assets.models import AssetCategory, AssetRecord


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

        # The Designer consumes the same provenance-bound runtime paths as Phaser.
        categories = {
            'ships': ('Ships', 'SHOOTER', 'ship', 10),
            'hazards': ('Hazards', 'SHOOTER', 'hazard', 20),
            'ui': ('Interface', 'BOTH', 'ui', 30),
            'boarding': ('Boarding', 'BOARDING', 'boarding', 40),
        }
        category_rows = {}
        for code, (name, mode, object_type, sort_order) in categories.items():
            category_rows[code], _ = AssetCategory.objects.get_or_create(
                code=code,
                defaults={'name': name, 'editor_mode': mode, 'object_type': object_type, 'sort_order': sort_order},
            )
        catalogue = [
            ('player.ship', 'ships', '/gg-runtime-assets/sprites/ships/gg_player_ship_v002_sheet.png', 'a3e2edbdee85b312ad1766ee00c5a5438f60abf9dfcd006b2bd8474012ddff38'),
            ('enemy.scout', 'ships', '/gg-runtime-assets/sprites/ships/gg_enemy_scout_v002_sheet.png', 'fbb60a9eb52346cb57cdf22fa1b6088dd24b08f9132540b05dfd0f1612405a7f'),
            ('projectile.nuke', 'ui', '/gg-runtime-assets/sprites/objects/gg_nuke_projectile_v002_horizontal_upright.png', '3b826087ad38eb6963046260ec384b9507c80e450dfaa3b302b923875b8b21aa'),
            ('hazard.asteroid', 'hazards', '/gg-runtime-assets/sprites/objects/gg_asteroid_v002_sheet.png', '0421bfd58ea30608adf8e0e684b22419f63f6c57dfcc06b59594be6947625d01'),
            ('hazard.comet', 'hazards', '/gg-runtime-assets/sprites/objects/gg_comet_v002_horizontal_vertical_facing.png', 'b9eb2bd211f9a922707cceea4e1eb4eaa5b1205249e38d6bbecb76dfba33978f'),
            ('ui.life-icon', 'ui', '/gg-runtime-assets/ui/icons/gg_hud_life_icon_v002.png', '9e0f8607f264acb9614958d7043c5f69f4a4ebb303d57049203fd481d1eb0408'),
            ('boarding.player', 'boarding', '/gg-runtime-assets/boarding/characters/player_001_v001.png', '136304bd25e0d04f8bb843bb51b6be0c5bf10d761bfab41d6bd53f782e70d115'),
        ]
        for key, category, runtime_path, digest in catalogue:
            AssetRecord.objects.update_or_create(
                key=key,
                defaults={
                    'category': category_rows[category], 'owner_scope': OwnerScope.CORE,
                    'visibility': Visibility.PUBLIC, 'status': AssetRecord.Status.ACTIVE,
                    'runtime_path': runtime_path, 'thumbnail_path': runtime_path,
                    'mime_type': 'image/png', 'checksum': digest,
                    'provenance_ref': 'apps/web/public/gg-runtime-assets/manifest.json',
                },
            )

        fixture = Path(__file__).resolve().parents[2] / 'fixtures' / 'level-01.json'
        level_one_config = json.loads(fixture.read_text(encoding='utf-8'))
        authored = {
            2: {'name': 'Asteroid Advance', 'enemy_formations': [{'type': 'scout', 'rows': 3, 'columns': 18, 'origin': {'x': 70, 'y': 120}, 'spacing': {'x': 54, 'y': 48}}], 'hazards': [{'type': 'asteroid', 'count': 3, 'speed': 72, 'origin': {'x': 180, 'y': 240}, 'spacing': {'x': 290, 'y': 64}}]},
            3: {'name': 'Cruiser Crossfire', 'enemy_formations': [{'type': 'scout', 'rows': 2, 'columns': 16, 'origin': {'x': 72, 'y': 110}, 'spacing': {'x': 64, 'y': 52}}, {'type': 'cruiser', 'rows': 1, 'columns': 6, 'origin': {'x': 180, 'y': 205}, 'spacing': {'x': 168, 'y': 1}}], 'hazards': [{'type': 'asteroid', 'count': 2, 'speed': 96, 'origin': {'x': 340, 'y': 265}, 'spacing': {'x': 520, 'y': 1}}]},
            4: {'name': 'Frigate Breach', 'enemy_formations': [{'type': 'scout', 'rows': 2, 'columns': 17, 'origin': {'x': 72, 'y': 110}, 'spacing': {'x': 62, 'y': 50}}, {'type': 'destroyer', 'rows': 1, 'columns': 4, 'origin': {'x': 240, 'y': 210}, 'spacing': {'x': 240, 'y': 1}}], 'hazards': [{'type': 'comet', 'count': 2, 'speed': 132, 'origin': {'x': 230, 'y': 268}, 'spacing': {'x': 620, 'y': 1}}]},
            5: {'name': 'Elite Gauntlet', 'enemy_formations': [{'type': 'scout', 'rows': 2, 'columns': 15, 'origin': {'x': 72, 'y': 105}, 'spacing': {'x': 70, 'y': 48}}, {'type': 'cruiser', 'rows': 1, 'columns': 5, 'origin': {'x': 170, 'y': 195}, 'spacing': {'x': 220, 'y': 1}}, {'type': 'destroyer', 'rows': 1, 'columns': 3, 'origin': {'x': 300, 'y': 262}, 'spacing': {'x': 320, 'y': 1}}], 'hazards': [{'type': 'comet', 'count': 3, 'speed': 155, 'origin': {'x': 160, 'y': 315}, 'spacing': {'x': 390, 'y': 1}}]},
            6: {'name': 'Final Assault', 'enemy_formations': [{'type': 'scout', 'rows': 2, 'columns': 14, 'origin': {'x': 80, 'y': 96}, 'spacing': {'x': 74, 'y': 46}}, {'type': 'cruiser', 'rows': 2, 'columns': 5, 'origin': {'x': 170, 'y': 190}, 'spacing': {'x': 220, 'y': 54}}, {'type': 'destroyer', 'rows': 1, 'columns': 4, 'origin': {'x': 210, 'y': 305}, 'spacing': {'x': 255, 'y': 1}}], 'hazards': [{'type': 'asteroid', 'count': 3, 'speed': 118, 'origin': {'x': 150, 'y': 330}, 'spacing': {'x': 350, 'y': 1}}, {'type': 'comet', 'count': 2, 'speed': 170, 'origin': {'x': 280, 'y': 380}, 'spacing': {'x': 580, 'y': 1}}]},
        }

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
            if sequence > 1:
                config.update(copy.deepcopy(authored[sequence]))
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
                if level.active_version.config == config:
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
        campaign_version = campaign.versions.filter(lifecycle=Lifecycle.PUBLISHED).order_by('-version').first()
        desired_versions = [level.active_version_id for level in levels]
        existing_versions = [] if campaign_version is None else list(campaign_version.entries.order_by('position').values_list('level_version_id', flat=True))
        if existing_versions != desired_versions:
            next_version = (campaign.versions.order_by('-version').first().version + 1) if campaign.versions.exists() else 1
            campaign_version = CampaignVersion.objects.create(campaign=campaign, version=next_version, created_by=system_user)
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
            version=f'h015-core-v{campaign_version.version}',
            defaults={'manifest': manifest, 'status': Lifecycle.PUBLISHED, 'created_by': system_user, 'published_by': system_user, 'published_at': timezone.now()},
        )
        if not created and release.status != Lifecycle.PUBLISHED:
            release.manifest = manifest
            release.status = Lifecycle.PUBLISHED
            release.published_by = system_user
            release.published_at = timezone.now()
            release.save()
        self.stdout.write(self.style.SUCCESS('Seeded six-entry published CORE campaign authority.'))
