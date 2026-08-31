import copy

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from campaigns.models import Campaign, CampaignEntry, CampaignVersion
from games.models import GameProject, GameRelease, Lifecycle, OwnerScope, Visibility
from game_runs.models import GameVersion
from levels.models import Level, LevelVersion
from assets.models import AssetCategory, AssetRecord


SHIELD_MATRIX = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
]


ENTITY_PROFILES = {
    'SCOUT': {'asset_id': 'enemy.scout', 'width': 44, 'height': 58, 'behaviour_profile': 'enemy.scout.standard'},
    'CRUISER': {'asset_id': 'enemy.cruiser', 'width': 72, 'height': 64, 'behaviour_profile': 'enemy.cruiser.standard'},
    'DESTROYER': {'asset_id': 'enemy.destroyer', 'width': 92, 'height': 74, 'behaviour_profile': 'enemy.destroyer.standard'},
    'MOTHERSHIP': {'asset_id': 'enemy.mothership', 'width': 260, 'height': 120, 'behaviour_profile': 'enemy.mothership.boss'},
}


def authored_entity(identifier, entity_type, x, y, *, profile=None):
    definition = ENTITY_PROFILES[entity_type]
    return {
        'id': identifier,
        'entity_type': entity_type,
        'asset_id': definition['asset_id'],
        'x': x,
        'y': y,
        'width': definition['width'],
        'height': definition['height'],
        'rotation': 0,
        'z_index': 4,
        'behaviour_profile': profile or definition['behaviour_profile'],
        'enabled': True,
        'tags': [],
    }


def formation(identifier, name, layout, members, *, motion='formation.standard', delay=0):
    xs = [member['x'] for member in members]
    ys = [member['y'] for member in members]
    return {
        'id': identifier,
        'name': name,
        'layout': layout,
        'bounds': {
            'x': min(xs),
            'y': min(ys),
            'width': max(xs) - min(xs),
            'height': max(ys) - min(ys),
        },
        'member_ids': [member['id'] for member in members],
        'motion_profile': motion,
        'entry_delay_ms': delay,
        'repeat': 0,
    }


def authored_grid(slug, prefix, entity_type, rows, columns, x, y, dx, dy, *, layout='GRID', profile=None):
    """Materialise formation coordinates before checksum/publication.

    The layout remains editable metadata, but runtime does not infer a visual
    formation from labels. It receives the exact coordinates reviewed in the
    Designer, including wedges and arcs.
    """
    members = []
    for row in range(rows):
        for column in range(columns):
            entity_x = x + column * dx
            entity_y = y + row * dy
            if layout == 'WEDGE':
                entity_x += abs(column - (columns - 1) / 2) * (dx * 0.12)
                entity_y += abs(column - (columns - 1) / 2) * max(8, dy * 0.32)
            elif layout == 'ARC':
                normalized = 0 if columns == 1 else (column / (columns - 1)) * 2 - 1
                entity_y += int((normalized * normalized) * max(22, dy * 1.15))
            members.append(authored_entity(
                f'{slug}:{prefix}:r{row}:c{column}', entity_type, entity_x, entity_y, profile=profile,
            ))
    return members


def hazard_emitter(identifier, hazard_type, *, initial_count, maximum_active, speed_min, speed_max, edges, pattern='ALTERNATING_EDGES', points=None, interval=3500):
    return {
        'id': identifier,
        'hazard_type': hazard_type,
        'asset_id': f'hazard.{hazard_type.lower()}',
        'enabled': True,
        'initial_count': initial_count,
        'maximum_active': maximum_active,
        'spawn_interval_ms': interval,
        'spawn_jitter_ms': 300,
        'speed_min': speed_min,
        'speed_max': speed_max,
        'angular_velocity_min': -80 if hazard_type == 'ASTEROID' else 0,
        'angular_velocity_max': 80 if hazard_type == 'ASTEROID' else 0,
        'entry_edges': edges,
        'spawn_pattern': pattern,
        'spawn_points': points or [],
        'despawn_margin': 64,
        'collision_damage': 1,
    }


def shield_structures(sequence):
    # Level 1 keeps its accepted 8 × 32-tile topology. Later levels retain
    # the same material count while changing the authored placement cadence.
    y = 520 if sequence == 1 else 500 + (sequence % 2) * 12
    spacing = 150 if sequence == 1 else 144
    return [
        {
            'id': f'shield-{sequence}-{index + 1}',
            'name': f'Bunker {index + 1}',
            'origin': {'x': 70 + index * spacing, 'y': y + (12 if sequence in {3, 5} and index % 2 else 0)},
            'tile_asset_id': 'shield.tile',
            'tile_width': 10,
            'tile_height': 10,
            'matrix': copy.deepcopy(SHIELD_MATRIX),
            'destructible': True,
        }
        for index in range(8)
    ]


def authored_level(sequence, name, groups, *, hazards, layouts=None, drop_rules=None, boarding_anchor=None):
    slug = f'level-{sequence:02d}'
    entities = []
    formations = []
    for group_index, group in enumerate(groups):
        entity_type, rows, columns, origin, spacing, layout = group
        profile = 'enemy.scout.diver' if sequence == 4 and entity_type == 'SCOUT' and group_index == 0 else None
        members = authored_grid(
            slug, f'formation-{group_index}', entity_type, rows, columns,
            origin[0], origin[1], spacing[0], spacing[1], layout=layout, profile=profile,
        )
        entities.extend(members)
        formations.append(formation(
            f'formation-{group_index}',
            f'{entity_type.title()} Formation {group_index + 1}',
            layouts[group_index] if layouts else layout,
            members,
            motion='formation.crossfire' if sequence in {3, 5, 6} else 'formation.standard',
            delay=group_index * 180,
        ))
    if boarding_anchor is not None:
        source = entities[boarding_anchor]
        anchors = [{
            'id': 'level-04-alien-frigate-01',
            'source_entity_id': source['id'],
            'source_ship_type': 'ALIEN_FRIGATE',
            'interior': {'slug': 'alien-frigate', 'version': 1, 'checksum': 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3'},
            'entry_envelope': {'width_px': 160, 'height_px': 128},
            'offer_duration_ms': 8000,
            'interaction': 'BOARD',
        }]
    else:
        anchors = []
    objectives = [{'id': 'destroy-hostiles', 'type': 'DESTROY_ALL_HOSTILES', 'required': True, 'target_entity_ids': [], 'duration_ms': None}]
    if sequence == 4:
        objectives.append({'id': 'board-frigate', 'type': 'BOARD_TARGET', 'required': False, 'target_entity_ids': [anchors[0]['source_entity_id']], 'duration_ms': None})
    if sequence == 6:
        boss = next(entity for entity in entities if entity['entity_type'] == 'MOTHERSHIP')
        objectives.append({'id': 'destroy-mothership', 'type': 'DESTROY_MOTHERSHIP', 'required': True, 'target_entity_ids': [boss['id']], 'duration_ms': None})
    return {
        'schema_version': '1.1',
        'id': slug,
        'slug': slug,
        'name': name,
        'version': 1,
        'status': 'PUBLISHED',
        'sequence': sequence,
        'seed': 12000 + sequence,
        'canvas': {'width': 1280, 'height': 720, 'grid_size': 16, 'snap_enabled': True, 'background_asset_id': 'background.starfield'},
        'player_spawns': [
            {'id': 'player-1', 'slot': 1, 'asset_id': 'player.ship', 'x': 640, 'y': 610, 'rotation': 0, 'enabled': True},
            {'id': 'player-2', 'slot': 2, 'asset_id': 'player.ship', 'x': 640, 'y': 610, 'rotation': 0, 'enabled': False},
        ],
        'entities': entities,
        'formations': formations,
        'hazard_emitters': hazards,
        'shield_structures': shield_structures(sequence),
        'drop_rules': drop_rules or [],
        'objectives': objectives,
        'boarding_anchors': anchors,
        'gameplay': {
            'player_lives_at_campaign_start': 3,
            'nukes_at_campaign_start': 2,
            'nuke_rearm_max': 150,
            'allow_pause': True,
            'allow_replay': True,
            'allow_main_menu_resume': True,
            'completion_bonus_profile': 'legacy',
            'scoring_profile': 'LEGACY_V1_GOVERNED',
        },
        'performance_budget': {
            'max_active_enemies': max(58, len(entities) + (4 if sequence == 6 else 0)),
            'max_active_hazards': 12,
            'max_projectiles': 96,
            'max_shield_tiles': 512,
            'max_total_runtime_objects': 1024,
        },
    }


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
            ('player.ship', 'ships', '/gg-runtime-assets/generated/sprites/ships/player_ship_v003.png', '0b3f8ea8d60033590f4d05de294bd7b4d7717cbb03a8b62f7b5f99c0b951601e'),
            ('enemy.scout', 'ships', '/gg-runtime-assets/generated/sprites/ships/enemy_scout_v003.png', '6c5fab7cef94373bf160fa464d17b8f1ae56386664d902cbeabb2ca6eff55237'),
            ('enemy.cruiser', 'ships', '/gg-runtime-assets/generated/sprites/ships/enemy_cruiser_v003.png', '8319c973f4277c14df9c1697d2310844dd4f48190e13edde1ccce9d1882fe07d'),
            ('enemy.destroyer', 'ships', '/gg-runtime-assets/generated/sprites/ships/enemy_destroyer_v003.png', '395daF22c4067282c25e0cc646b5e7b236be57c1e93afc2c5aeff68ad164b69f'),
            ('enemy.mothership', 'ships', '/gg-runtime-assets/generated/sprites/ships/mothership_normal_v003.png', '9767f1395cab3e69274cab3760f9ee3d51aae433d87ad69d960d6138b98cbf81'),
            ('enemy.mothership.hit', 'ships', '/gg-runtime-assets/sprites/ships/gg_boss_mothership_HIT_v002_sheet.png', 'e829b094078363f051f41929f48e92c3288b98e2cd43425e8a0309b52b989088'),
            ('projectile.nuke', 'ui', '/gg-runtime-assets/generated/sprites/objects/nuke_projectile_v003.png', 'f36b7413d933ca086466e0b5daef9e7f0bbc9b0271acd90419671f72c60a5d18'),
            ('hazard.asteroid', 'hazards', '/gg-runtime-assets/generated/sprites/objects/asteroid_variants_v003.png', '9d17274b80d70365ccfcfce9fc5432bd5335e2735c67ac6fbb5e1c798021ba5f'),
            ('hazard.comet', 'hazards', '/gg-runtime-assets/generated/sprites/objects/comet_variants_v003.png', '81f0544da23d1608cfe162c58d5803dac35c34a3fe7016ebd5385deaa0540e93'),
            ('ui.life-icon', 'ui', '/gg-runtime-assets/ui/icons/gg_hud_life_icon_v002.png', '9e0f8607f264acb9614958d7043c5f69f4a4ebb303d57049203fd481d1eb0408'),
            ('boarding.player', 'boarding', '/gg-runtime-assets/generated/boarding/player_idle_v002.png', '2f238f5784c1f6b0f5e378dea0bfcc461c3e35feee5daf37d0de73cec27a3794'),
        ]
        designer_previews = {
            'player.ship': '/gg-runtime-assets/generated/thumbnails/player-ship.png',
            'enemy.scout': '/gg-runtime-assets/generated/thumbnails/enemy-scout.png',
            'enemy.cruiser': '/gg-runtime-assets/generated/thumbnails/enemy-cruiser.png',
            'enemy.destroyer': '/gg-runtime-assets/generated/thumbnails/enemy-destroyer.png',
            'enemy.mothership': '/gg-runtime-assets/generated/thumbnails/enemy-mothership.png',
            'projectile.nuke': '/gg-runtime-assets/generated/thumbnails/projectile-nuke.png',
            'hazard.asteroid': '/gg-runtime-assets/generated/thumbnails/fx-asteroid.png',
            'hazard.comet': '/gg-runtime-assets/generated/thumbnails/fx-comet.png',
        }
        for key, category, runtime_path, digest in catalogue:
            AssetRecord.objects.update_or_create(
                key=key,
                defaults={
                    'category': category_rows[category], 'owner_scope': OwnerScope.CORE,
                    'visibility': Visibility.PUBLIC, 'status': AssetRecord.Status.ACTIVE,
                    'runtime_path': runtime_path,
                    'thumbnail_path': designer_previews.get(key, runtime_path),
                    'mime_type': 'image/png', 'checksum': digest,
                    'provenance_ref': 'apps/web/public/gg-runtime-assets/manifest.json',
                },
            )

        authored = {
            1: authored_level(1, 'Frontier Screen', [('SCOUT', 2, 29, (50, 120), (40, 50), 'GRID')], hazards=[hazard_emitter('level-01-asteroids', 'ASTEROID', initial_count=1, maximum_active=2, speed_min=64, speed_max=84, edges=['LEFT', 'RIGHT'], interval=6200), hazard_emitter('level-01-comets', 'COMET', initial_count=0, maximum_active=1, speed_min=130, speed_max=150, edges=['TOP'], interval=10000)]),
            2: authored_level(2, 'Asteroid Advance', [('SCOUT', 3, 16, (70, 112), (66, 48), 'GRID'), ('CRUISER', 1, 8, (190, 268), (128, 0), 'LINE')], hazards=[hazard_emitter('level-02-asteroids', 'ASTEROID', initial_count=3, maximum_active=5, speed_min=105, speed_max=145, edges=['LEFT', 'RIGHT'], interval=3200), hazard_emitter('level-02-comets', 'COMET', initial_count=1, maximum_active=3, speed_min=160, speed_max=210, edges=['TOP', 'RIGHT'], interval=5200)], drop_rules=[{'id': 'level-02-scout-drops', 'host_entity_types': ['SCOUT'], 'pickup_type': 'NUKE', 'probability': 0.18, 'maximum_per_level': 2, 'collection_window_ms': 6000}]),
            3: authored_level(3, 'Cruiser Crossfire', [('SCOUT', 2, 16, (72, 108), (64, 52), 'GRID'), ('CRUISER', 2, 6, (170, 230), (168, 52), 'WEDGE'), ('DESTROYER', 1, 4, (220, 330), (248, 0), 'LINE')], hazards=[hazard_emitter('level-03-asteroids', 'ASTEROID', initial_count=2, maximum_active=5, speed_min=120, speed_max=168, edges=['LEFT', 'RIGHT'], pattern='LANE', points=[{'x': 0, 'y': 260}, {'x': 1280, 'y': 330}], interval=2600)], drop_rules=[{'id': 'level-03-combat-drops', 'host_entity_types': ['SCOUT', 'CRUISER'], 'pickup_type': 'NUKE', 'probability': 0.14, 'maximum_per_level': 2, 'collection_window_ms': 6000}, {'id': 'level-03-life-drop', 'host_entity_types': ['DESTROYER'], 'pickup_type': 'LIFE', 'probability': 0.08, 'maximum_per_level': 1, 'collection_window_ms': 6000}]),
            4: authored_level(4, 'Frigate Breach', [('SCOUT', 2, 15, (72, 110), (68, 50), 'ARC'), ('CRUISER', 1, 6, (170, 224), (170, 0), 'LINE'), ('DESTROYER', 1, 4, (240, 310), (240, 0), 'WEDGE')], hazards=[hazard_emitter('level-04-comets', 'COMET', initial_count=2, maximum_active=4, speed_min=175, speed_max=235, edges=['LEFT', 'RIGHT'], interval=3000)], drop_rules=[{'id': 'level-04-scout-drops', 'host_entity_types': ['SCOUT'], 'pickup_type': 'NUKE', 'probability': 0.16, 'maximum_per_level': 2, 'collection_window_ms': 6000}], boarding_anchor=30),
            5: authored_level(5, 'Elite Gauntlet', [('SCOUT', 2, 12, (72, 105), (84, 48), 'GRID'), ('CRUISER', 2, 6, (160, 205), (176, 58), 'WEDGE'), ('DESTROYER', 2, 4, (210, 325), (255, 55), 'LINE')], hazards=[hazard_emitter('level-05-asteroids', 'ASTEROID', initial_count=3, maximum_active=6, speed_min=135, speed_max=180, edges=['LEFT', 'RIGHT', 'TOP'], interval=2200), hazard_emitter('level-05-comets', 'COMET', initial_count=2, maximum_active=4, speed_min=190, speed_max=250, edges=['TOP', 'RIGHT'], interval=3600)], drop_rules=[{'id': 'level-05-scarce-drops', 'host_entity_types': ['SCOUT', 'CRUISER'], 'pickup_type': 'NUKE', 'probability': 0.08, 'maximum_per_level': 1, 'collection_window_ms': 6000}]),
            6: authored_level(6, 'Final Assault', [('SCOUT', 2, 9, (80, 96), (120, 46), 'ARC'), ('CRUISER', 2, 5, (170, 190), (220, 54), 'WEDGE'), ('DESTROYER', 2, 3, (210, 305), (330, 55), 'LINE'), ('MOTHERSHIP', 1, 1, (640, 120), (0, 0), 'FREEFORM')], hazards=[hazard_emitter('level-06-asteroids', 'ASTEROID', initial_count=3, maximum_active=6, speed_min=145, speed_max=195, edges=['LEFT', 'RIGHT', 'TOP'], interval=2000), hazard_emitter('level-06-comets', 'COMET', initial_count=2, maximum_active=4, speed_min=210, speed_max=270, edges=['TOP', 'RIGHT'], interval=3000)], drop_rules=[{'id': 'level-06-scarce-drops', 'host_entity_types': ['SCOUT', 'CRUISER'], 'pickup_type': 'NUKE', 'probability': 0.05, 'maximum_per_level': 1, 'collection_window_ms': 6000}]),
        }

        for sequence in range(1, 7):
            slug = f'level-{sequence:02d}'
            level, _ = Level.objects.get_or_create(
                slug=slug,
                game_project=core_project,
                defaults={'name': authored[sequence]['name'], 'sequence': sequence},
            )
            config = copy.deepcopy(authored[sequence])
            if level.name != config['name'] or level.sequence != sequence:
                level.name = config['name']
                level.sequence = sequence
                level.save(update_fields=['name', 'sequence', 'updated_at'])

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
