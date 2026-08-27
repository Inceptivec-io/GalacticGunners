"""Schema 1.1 authoring validation and deterministic runtime compilation."""

from copy import deepcopy


ENTITY_TYPES = {'SCOUT', 'CRUISER', 'DESTROYER', 'MOTHERSHIP', 'ASTEROID', 'COMET', 'SHIELD_TILE', 'NUKE_PICKUP', 'LIFE_PICKUP'}
SHIP_TYPES = {'SCOUT', 'CRUISER', 'DESTROYER', 'MOTHERSHIP'}
FORMATION_LAYOUTS = {'GRID', 'LINE', 'WEDGE', 'ARC', 'FREEFORM'}
HAZARD_TYPES = {'ASTEROID', 'COMET'}


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
                result['entities'].append({'id': entity_id, 'entity_type': formation['type'].upper(), 'asset_id': f"enemy.{formation['type']}", 'x': formation['origin']['x'] + column * formation['spacing']['x'], 'y': formation['origin']['y'] + row * formation['spacing']['y'], 'width': {'scout': 44, 'cruiser': 72, 'destroyer': 92}[formation['type']], 'height': {'scout': 58, 'cruiser': 64, 'destroyer': 74}[formation['type']], 'rotation': 0, 'z_index': 2, 'behaviour_profile': f"enemy.{formation['type']}.standard", 'enabled': True, 'tags': []})
        result['formations'].append({'id': f'formation-{formation_index}', 'name': f"Formation {formation_index + 1}", 'layout': 'GRID', 'bounds': {'x': formation['origin']['x'], 'y': formation['origin']['y'], 'width': max(1, formation['columns'] - 1) * formation['spacing']['x'], 'height': max(1, formation['rows'] - 1) * formation['spacing']['y']}, 'member_ids': members, 'motion_profile': 'formation.standard', 'entry_delay_ms': 0, 'repeat': 0})
    for index, hazard in enumerate(value.get('hazards', [])):
        result['hazard_emitters'].append({'id': f"{hazard['type']}-emitter-{index + 1}", 'hazard_type': hazard['type'].upper(), 'asset_id': f"hazard.{hazard['type']}", 'enabled': True, 'initial_count': hazard['count'], 'maximum_active': hazard['count'], 'spawn_interval_ms': 3500, 'spawn_jitter_ms': 0, 'speed_min': hazard['speed'], 'speed_max': hazard['speed'], 'angular_velocity_min': 0, 'angular_velocity_max': 0, 'entry_edges': ['TOP'], 'spawn_pattern': 'FIXED_POINTS', 'spawn_points': [{'x': hazard['origin']['x'] + item * hazard['spacing']['x'], 'y': hazard['origin']['y'] + item * hazard['spacing']['y']} for item in range(hazard['count'])], 'despawn_margin': 64, 'collision_damage': 1})
    for index, shield in enumerate(value.get('shields', [])):
        for bunker in range(shield['count']):
            result['shield_structures'].append({'id': f'shield-{index + 1}-{bunker + 1}', 'name': f"Bunker {bunker + 1}", 'origin': {'x': 100 + bunker * 135, 'y': 560}, 'tile_asset_id': 'shield.tile', 'tile_width': 10, 'tile_height': 10, 'matrix': shield['matrix'], 'destructible': True})
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
    entity_ids = {entity.get('id') for entity in entities}
    enabled_spawns = [spawn for spawn in value.get('player_spawns', []) if spawn.get('enabled')]
    if len(enabled_spawns) != 1 or enabled_spawns[0].get('slot') != 1: issue('/player_spawns', 'PLAYER_SPAWN_CARDINALITY')
    if sum(entity.get('entity_type') == 'MOTHERSHIP' and entity.get('enabled') for entity in entities) > 1: issue('/entities', 'MOTHERSHIP_CARDINALITY')
    for index, entity in enumerate(entities):
        if entity.get('entity_type') not in ENTITY_TYPES or entity.get('id') not in entity_ids or not 0 <= entity.get('x', -1) <= 1280 or not 0 <= entity.get('y', -1) <= 720: issue(f'/entities/{index}', 'INVALID_ENTITY')
    for index, formation in enumerate(value.get('formations', [])):
        if formation.get('layout') not in FORMATION_LAYOUTS or any(member not in entity_ids for member in formation.get('member_ids', [])): issue(f'/formations/{index}/member_ids', 'UNKNOWN_ENTITY_REFERENCE')
    for index, emitter in enumerate(value.get('hazard_emitters', [])):
        if emitter.get('hazard_type') not in HAZARD_TYPES or emitter.get('maximum_active', 0) < emitter.get('initial_count', 0) or emitter.get('maximum_active', 0) < 1: issue(f'/hazard_emitters/{index}', 'INVALID_EMITTER')
    shield_tiles = sum(sum(row.count(1) for row in item.get('matrix', [])) for item in value.get('shield_structures', []))
    budget = value.get('performance_budget', {})
    if len([entity for entity in entities if entity.get('entity_type') in SHIP_TYPES and entity.get('enabled')]) > budget.get('max_active_enemies', 0): issue('/performance_budget/max_active_enemies', 'ENEMY_BUDGET_EXCEEDED')
    if shield_tiles > budget.get('max_shield_tiles', 0): issue('/performance_budget/max_shield_tiles', 'SHIELD_BUDGET_EXCEEDED')
    for index, anchor in enumerate(value.get('boarding_anchors', [])):
        if anchor.get('source_entity_id') not in entity_ids or anchor.get('offer_duration_ms') != 8000: issue(f'/boarding_anchors/{index}', 'INVALID_BOARDING_ANCHOR')
    return errors
