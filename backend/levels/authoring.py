"""Schema 1.1 authoring validation and deterministic runtime compilation."""

from copy import deepcopy


ENTITY_TYPES = {'SCOUT', 'CRUISER', 'DESTROYER', 'MOTHERSHIP', 'ASTEROID', 'COMET', 'SHIELD_TILE', 'NUKE_PICKUP', 'LIFE_PICKUP'}
SHIP_TYPES = {'SCOUT', 'CRUISER', 'DESTROYER', 'MOTHERSHIP'}
FORMATION_LAYOUTS = {'GRID', 'LINE', 'WEDGE', 'ARC', 'FREEFORM'}
HAZARD_TYPES = {'ASTEROID', 'COMET'}
OBJECTIVE_TYPES = {'DESTROY_ALL_HOSTILES', 'DESTROY_MOTHERSHIP', 'SURVIVE_DURATION', 'BOARD_TARGET'}
EMITTER_PATTERNS = {'RANDOM_EDGE', 'ALTERNATING_EDGES', 'LANE', 'FIXED_POINTS'}
EDGES = {'TOP', 'RIGHT', 'BOTTOM', 'LEFT'}
ENTITY_ASSETS = {
    'SCOUT': {'enemy.scout'}, 'CRUISER': {'enemy.cruiser'}, 'DESTROYER': {'enemy.destroyer'},
    'MOTHERSHIP': {'enemy.mothership'}, 'ASTEROID': {'hazard.asteroid'}, 'COMET': {'hazard.comet'},
    'SHIELD_TILE': {'shield.tile'}, 'NUKE_PICKUP': {'projectile.nuke'}, 'LIFE_PICKUP': {'ui.life-icon'},
}


def blank_authoring_document(*, identifier, slug, name, sequence, seed):
    """A genuinely blank, executable H015 map: no placeholder formation or hidden enemies."""
    return {
        'schema_version': '1.1', 'id': identifier, 'slug': slug, 'name': name,
        'version': 1, 'status': 'DRAFT', 'sequence': sequence, 'seed': seed,
        'canvas': {'width': 1280, 'height': 720, 'grid_size': 16, 'snap_enabled': True, 'background_asset_id': 'background.starfield'},
        'player_spawns': [
            {'id': 'player-1', 'slot': 1, 'asset_id': 'player.ship', 'x': 640, 'y': 610, 'rotation': 0, 'enabled': True},
            {'id': 'player-2', 'slot': 2, 'asset_id': 'player.ship', 'x': 640, 'y': 610, 'rotation': 0, 'enabled': False},
        ],
        'entities': [], 'formations': [], 'hazard_emitters': [], 'shield_structures': [], 'drop_rules': [],
        'objectives': [{'id': 'destroy-hostiles', 'type': 'DESTROY_ALL_HOSTILES', 'required': True, 'target_entity_ids': [], 'duration_ms': None}],
        'boarding_anchors': [],
        'gameplay': {'player_lives_at_campaign_start': 3, 'nukes_at_campaign_start': 2, 'nuke_rearm_max': 150, 'allow_pause': True, 'allow_replay': True, 'allow_main_menu_resume': True, 'completion_bonus_profile': 'legacy', 'scoring_profile': 'LEGACY_V1_GOVERNED'},
        'performance_budget': {'max_active_enemies': 58, 'max_active_hazards': 12, 'max_projectiles': 96, 'max_shield_tiles': 512, 'max_total_runtime_objects': 1024},
    }


def migrate_v1_to_v11(value):
    """Materialise legacy cells into inspectable authored objects without loss."""
    if value.get('schema_version') != '1.0':
        return deepcopy(value)
    result = {
        'schema_version': '1.1', 'id': value['id'], 'slug': value['slug'], 'name': value['name'],
        'version': value['version'], 'status': value['status'], 'sequence': value['sequence'], 'seed': value['seed'],
        'canvas': {'width': 1280, 'height': 720, 'grid_size': 16, 'snap_enabled': True, 'background_asset_id': 'background.starfield'},
        'player_spawns': [{'id': 'player-1', 'slot': 1, 'asset_id': 'player.ship', 'x': value['player']['x'], 'y': value['player']['y'], 'rotation': 0, 'enabled': True}, {'id': 'player-2', 'slot': 2, 'asset_id': 'player.ship', 'x': value['player']['x'], 'y': value['player']['y'], 'rotation': 0, 'enabled': False}],
        'entities': [], 'formations': [], 'hazard_emitters': [], 'shield_structures': [],
        'drop_rules': [], 'objectives': [{'id': 'destroy-hostiles', 'type': 'DESTROY_ALL_HOSTILES', 'required': True, 'target_entity_ids': [], 'duration_ms': None}],
        'boarding_anchors': [],
        'gameplay': {'player_lives_at_campaign_start': 3, 'nukes_at_campaign_start': 2, 'nuke_rearm_max': 150, 'allow_pause': True, 'allow_replay': True, 'allow_main_menu_resume': True, 'completion_bonus_profile': 'legacy', 'scoring_profile': 'LEGACY_V1_GOVERNED'},
        'performance_budget': {'max_active_enemies': value['performance_budget']['max_enemies'], 'max_active_hazards': 12, 'max_projectiles': 96, 'max_shield_tiles': 512, 'max_total_runtime_objects': 1024},
    }
    for formation_index, formation in enumerate(value.get('enemy_formations', [])):
        members = []
        for row in range(formation['rows']):
            for column in range(formation['columns']):
                entity_id = f"{value['slug']}:formation-{formation_index}:r{row}:c{column}"
                members.append(entity_id)
                profile = {
                    'scout': (44, 58, 'enemy.scout.standard'),
                    'cruiser': (72, 64, 'enemy.cruiser.standard'),
                    'destroyer': (92, 74, 'enemy.destroyer.standard'),
                    'mothership': (260, 120, 'enemy.mothership.boss'),
                }[formation['type']]
                result['entities'].append({'id': entity_id, 'entity_type': formation['type'].upper(), 'asset_id': f"enemy.{formation['type']}", 'x': formation['origin']['x'] + column * formation['spacing']['x'], 'y': formation['origin']['y'] + row * formation['spacing']['y'], 'width': formation.get('width', profile[0]), 'height': formation.get('height', profile[1]), 'rotation': 0, 'z_index': 2, 'behaviour_profile': formation.get('behaviour_profile', profile[2]), 'enabled': True, 'tags': []})
        result['formations'].append({'id': f'formation-{formation_index}', 'name': f"Formation {formation_index + 1}", 'layout': 'GRID', 'bounds': {'x': formation['origin']['x'], 'y': formation['origin']['y'], 'width': max(1, formation['columns'] - 1) * formation['spacing']['x'], 'height': max(1, formation['rows'] - 1) * formation['spacing']['y']}, 'member_ids': members, 'motion_profile': 'formation.standard', 'entry_delay_ms': 0, 'repeat': 0})
    for index, hazard in enumerate(value.get('hazards', [])):
        result['hazard_emitters'].append({'id': f"{hazard['type']}-emitter-{index + 1}", 'hazard_type': hazard['type'].upper(), 'asset_id': f"hazard.{hazard['type']}", 'enabled': True, 'initial_count': hazard['count'], 'maximum_active': hazard['count'], 'spawn_interval_ms': 3500, 'spawn_jitter_ms': 0, 'speed_min': hazard['speed'], 'speed_max': hazard['speed'], 'angular_velocity_min': 0, 'angular_velocity_max': 0, 'entry_edges': ['TOP'], 'spawn_pattern': 'FIXED_POINTS', 'spawn_points': [{'x': hazard['origin']['x'] + item * hazard['spacing']['x'], 'y': hazard['origin']['y'] + item * hazard['spacing']['y']} for item in range(hazard['count'])], 'despawn_margin': 64, 'collision_damage': 1})
    for index, shield in enumerate(value.get('shields', [])):
        for bunker in range(shield['count']):
            # Matches the established eight-bunker Level 1 layout at the canonical 1280x720 canvas.
            result['shield_structures'].append({'id': f'shield-{index + 1}-{bunker + 1}', 'name': f"Bunker {bunker + 1}", 'origin': {'x': 70 + bunker * 150, 'y': 520}, 'tile_asset_id': 'shield.tile', 'tile_width': 10, 'tile_height': 10, 'matrix': shield['matrix'], 'destructible': True})
    for table_index, table in enumerate(value.get('drop_tables', [])):
        for entry_index, entry in enumerate(table.get('entries', [])):
            result['drop_rules'].append({
                'id': f'drop-{table_index + 1}-{entry_index + 1}',
                'host_entity_types': [table.get('host', 'scout').upper()],
                'pickup_type': entry['pickup'].upper(),
                'probability': entry['weight'],
                'maximum_per_level': entry.get('maximum_per_level', 2),
                'collection_window_ms': 6000,
            })
    for anchor in value.get('boarding_anchors', []):
        result['boarding_anchors'].append({'id': anchor['id'], 'source_entity_id': anchor['source_entity_id'], 'source_ship_type': 'ALIEN_FRIGATE', 'interior': anchor['interior'], 'entry_envelope': anchor['entry_envelope'], 'offer_duration_ms': 8000, 'interaction': 'BOARD'})
    return result


def validate_authoring_document(value):
    errors = []
    def issue(path, code): errors.append({'path': path, 'code': code, 'message': code.replace('_', ' ').lower()})
    if value.get('schema_version') != '1.1': issue('/schema_version', 'UNSUPPORTED_SCHEMA')
    canvas = value.get('canvas', {})
    if canvas.get('width') != 1280 or canvas.get('height') != 720 or canvas.get('grid_size') not in {8, 16, 24, 32}: issue('/canvas', 'INVALID_CANVAS')
    entities = value.get('entities', [])
    entity_ids = [entity.get('id') for entity in entities]
    entity_id_set = set(entity_ids)
    if not all(isinstance(entity_id, str) and entity_id for entity_id in entity_ids) or len(entity_ids) != len(entity_id_set):
        issue('/entities', 'DUPLICATE_OR_INVALID_ENTITY_ID')
    spawns = value.get('player_spawns', [])
    enabled_spawns = [spawn for spawn in spawns if spawn.get('enabled')]
    if len(enabled_spawns) != 1 or enabled_spawns[0].get('slot') != 1: issue('/player_spawns', 'PLAYER_SPAWN_CARDINALITY')
    for index, spawn in enumerate(spawns):
        if (
            spawn.get('slot') not in {1, 2}
            or spawn.get('asset_id') != 'player.ship'
            or not isinstance(spawn.get('x'), (int, float)) or not 0 <= spawn['x'] <= 1280
            or not isinstance(spawn.get('y'), (int, float)) or not 0 <= spawn['y'] <= 720
            or not isinstance(spawn.get('enabled'), bool)
        ):
            issue(f'/player_spawns/{index}', 'INVALID_PLAYER_SPAWN')
    if sum(entity.get('entity_type') == 'MOTHERSHIP' and entity.get('enabled') for entity in entities) > 1: issue('/entities', 'MOTHERSHIP_CARDINALITY')
    for index, entity in enumerate(entities):
        if (
            entity.get('entity_type') not in ENTITY_TYPES
            or not isinstance(entity.get('asset_id'), str)
            or entity.get('asset_id') not in ENTITY_ASSETS.get(entity.get('entity_type'), set())
            or not isinstance(entity.get('width'), (int, float)) or entity['width'] <= 0
            or not isinstance(entity.get('height'), (int, float)) or entity['height'] <= 0
            or not 0 <= entity.get('x', -1) <= 1280
            or not 0 <= entity.get('y', -1) <= 720
            or entity.get('x', 0) - entity.get('width', 0) / 2 < 0
            or entity.get('x', 0) + entity.get('width', 0) / 2 > 1280
            or entity.get('y', 0) - entity.get('height', 0) / 2 < 0
            or entity.get('y', 0) + entity.get('height', 0) / 2 > 720
            or not isinstance(entity.get('behaviour_profile'), str) or not entity['behaviour_profile']
        ):
            issue(f'/entities/{index}', 'INVALID_ENTITY')
    for index, formation in enumerate(value.get('formations', [])):
        member_ids = formation.get('member_ids', [])
        bounds = formation.get('bounds', {})
        if (
            formation.get('layout') not in FORMATION_LAYOUTS
            or not member_ids
            or len(member_ids) != len(set(member_ids))
            or any(member not in entity_id_set for member in member_ids)
            or not all(isinstance(bounds.get(key), (int, float)) and bounds[key] >= 0 for key in ('x', 'y', 'width', 'height'))
            or bounds.get('x', 0) + bounds.get('width', 0) > 1280
            or bounds.get('y', 0) + bounds.get('height', 0) > 720
        ):
            issue(f'/formations/{index}/member_ids', 'UNKNOWN_ENTITY_REFERENCE')
    for index, emitter in enumerate(value.get('hazard_emitters', [])):
        numeric = ('initial_count', 'maximum_active', 'spawn_interval_ms', 'spawn_jitter_ms', 'speed_min', 'speed_max', 'angular_velocity_min', 'angular_velocity_max', 'despawn_margin', 'collision_damage')
        if (
            emitter.get('hazard_type') not in HAZARD_TYPES
            or emitter.get('asset_id') != f"hazard.{str(emitter.get('hazard_type', '')).lower()}"
            or emitter.get('maximum_active', 0) < emitter.get('initial_count', 0)
            or emitter.get('maximum_active', 0) < 1
            or emitter.get('spawn_pattern') not in EMITTER_PATTERNS
            or not emitter.get('entry_edges') or any(edge not in EDGES for edge in emitter.get('entry_edges', []))
            or any(not isinstance(emitter.get(field), (int, float)) or emitter[field] < 0 for field in numeric)
            or emitter.get('speed_max', 0) < emitter.get('speed_min', 0)
            or any(not isinstance(point.get('x'), (int, float)) or not isinstance(point.get('y'), (int, float)) or not 0 <= point['x'] <= 1280 or not 0 <= point['y'] <= 720 for point in emitter.get('spawn_points', []))
        ):
            issue(f'/hazard_emitters/{index}', 'INVALID_EMITTER')
    for index, rule in enumerate(value.get('drop_rules', [])):
        if (
            not rule.get('host_entity_types')
            or any(host not in {'SCOUT', 'CRUISER', 'DESTROYER'} for host in rule.get('host_entity_types', []))
            or rule.get('pickup_type') not in {'NUKE', 'LIFE'}
            or not isinstance(rule.get('probability'), (int, float)) or not 0 <= rule['probability'] <= 1
            or not isinstance(rule.get('maximum_per_level'), int) or rule['maximum_per_level'] < 0
        ):
            issue(f'/drop_rules/{index}', 'INVALID_DROP_RULE')
    shield_tiles = 0
    for index, structure in enumerate(value.get('shield_structures', [])):
        matrix = structure.get('matrix', [])
        if (
            not matrix or any(not isinstance(row, list) or any(tile not in {0, 1} for tile in row) for row in matrix)
            or structure.get('tile_asset_id') != 'shield.tile'
            or structure.get('destructible') is not True
            or not isinstance(structure.get('tile_width'), (int, float)) or structure['tile_width'] <= 0
            or not isinstance(structure.get('tile_height'), (int, float)) or structure['tile_height'] <= 0
            or not isinstance(structure.get('origin', {}).get('x'), (int, float)) or not isinstance(structure.get('origin', {}).get('y'), (int, float))
        ):
            issue(f'/shield_structures/{index}/matrix', 'INVALID_SHIELD_MATRIX')
            continue
        shield_tiles += sum(row.count(1) for row in matrix)
    budget = value.get('performance_budget', {})
    if len([entity for entity in entities if entity.get('entity_type') in SHIP_TYPES and entity.get('enabled')]) > budget.get('max_active_enemies', 0): issue('/performance_budget/max_active_enemies', 'ENEMY_BUDGET_EXCEEDED')
    if shield_tiles > budget.get('max_shield_tiles', 0): issue('/performance_budget/max_shield_tiles', 'SHIELD_BUDGET_EXCEEDED')
    if len([emitter for emitter in value.get('hazard_emitters', []) if emitter.get('enabled')]) > budget.get('max_active_hazards', 0): issue('/performance_budget/max_active_hazards', 'HAZARD_BUDGET_EXCEEDED')
    runtime_total = len(entities) + shield_tiles + sum(emitter.get('maximum_active', 0) for emitter in value.get('hazard_emitters', []) if emitter.get('enabled'))
    if runtime_total > budget.get('max_total_runtime_objects', 0): issue('/performance_budget/max_total_runtime_objects', 'RUNTIME_OBJECT_BUDGET_EXCEEDED')
    for index, objective in enumerate(value.get('objectives', [])):
        if (
            objective.get('type') not in OBJECTIVE_TYPES
            or not isinstance(objective.get('required'), bool)
            or any(entity_id not in entity_id_set for entity_id in objective.get('target_entity_ids', []))
            or (objective.get('type') == 'SURVIVE_DURATION' and (not isinstance(objective.get('duration_ms'), int) or objective['duration_ms'] <= 0))
        ):
            issue(f'/objectives/{index}', 'INVALID_OBJECTIVE')
    for index, anchor in enumerate(value.get('boarding_anchors', [])):
        source = next((entity for entity in entities if entity.get('id') == anchor.get('source_entity_id')), None)
        if (
            # Existing governed Level 4 anchors a legacy Scout identity. New
            # authored maps may target a Cruiser or Destroyer, but migration
            # must retain that accepted stable source coordinate.
            not source or source.get('entity_type') not in {'SCOUT', 'CRUISER', 'DESTROYER'}
            or anchor.get('source_ship_type') != 'ALIEN_FRIGATE'
            or anchor.get('offer_duration_ms') != 8000
            or anchor.get('interaction') != 'BOARD'
            or anchor.get('interior', {}).get('slug') != 'alien-frigate'
        ):
            issue(f'/boarding_anchors/{index}', 'INVALID_BOARDING_ANCHOR')
    return errors
