import type { LevelAuthoringDocument } from './LevelAuthoringDocument';
import type { LevelDefinition } from './LevelDefinition';

export function isLevelAuthoringDocument(value: unknown): value is LevelAuthoringDocument {
  return Boolean(value && typeof value === 'object' && (value as { schema_version?: string }).schema_version === '1.1');
}

/** Convert authored objects into the existing Phaser contract without creating a second runtime. */
export function compileLevelDocument(value: LevelDefinition | LevelAuthoringDocument): LevelDefinition {
  if (!isLevelAuthoringDocument(value)) return value;
  const player = value.player_spawns.find((spawn) => spawn.slot === 1 && spawn.enabled);
  if (!player) throw new Error('Authoring document has no enabled player spawn.');
  const ships = value.entities.filter((entity) => entity.enabled && ['SCOUT', 'CRUISER', 'DESTROYER', 'MOTHERSHIP'].includes(entity.entity_type));
  const groupedIds = new Set<string>();
  const enemy_formations = value.formations.flatMap((formation) => {
    const members = formation.member_ids.map((id) => ships.find((entity) => entity.id === id)).filter(Boolean) as typeof ships;
    members.forEach((member) => groupedIds.add(member.id));
    const types = [...new Set(members.map((member) => member.entity_type))];
    if (formation.layout === 'GRID' && types.length === 1 && members.length > 1) {
      const xs = [...new Set(members.map((member) => member.x))].sort((a, b) => a - b);
      const ys = [...new Set(members.map((member) => member.y))].sort((a, b) => a - b);
      return [{
        id: formation.id, type: types[0].toLowerCase() as 'scout' | 'cruiser' | 'destroyer' | 'mothership', rows: ys.length, columns: xs.length,
        origin: { x: xs[0], y: ys[0] }, spacing: { x: xs.length > 1 ? xs[1] - xs[0] : 0, y: ys.length > 1 ? ys[1] - ys[0] : 0 },
        width: members[0].width, height: members[0].height, behaviour_profile: members[0].behaviour_profile,
      }];
    }
    return members.map((entity) => ({
      id: `${formation.id}:${entity.id}`, type: entity.entity_type.toLowerCase() as 'scout' | 'cruiser' | 'destroyer' | 'mothership', rows: 1, columns: 1,
      origin: { x: entity.x, y: entity.y }, spacing: { x: 0, y: 0 }, width: entity.width, height: entity.height,
      behaviour_profile: entity.behaviour_profile, entity_id: entity.id, fixed_position: true,
    }));
  }).concat(ships.filter((entity) => !groupedIds.has(entity.id)).map((entity) => ({
    id: entity.id, type: entity.entity_type.toLowerCase() as 'scout' | 'cruiser' | 'destroyer' | 'mothership', rows: 1, columns: 1,
    origin: { x: entity.x, y: entity.y }, spacing: { x: 0, y: 0 }, width: entity.width, height: entity.height,
    behaviour_profile: entity.behaviour_profile, entity_id: entity.id, fixed_position: true,
  })));
  const shields = value.shield_structures.map((shield) => ({ count: 1, matrix: shield.matrix, origin: shield.origin, tile_width: shield.tile_width, tile_height: shield.tile_height, id: shield.id }));
  const boarding_anchors = value.boarding_anchors.map((anchor) => {
    const source = value.entities.find((entity) => entity.id === anchor.source_entity_id);
    const authoredFormation = value.formations.find((formation) => formation.member_ids.includes(anchor.source_entity_id));
    const runtimeIndex = authoredFormation ? enemy_formations.findIndex((formation) => formation.id === authoredFormation.id) : enemy_formations.findIndex((formation) => formation.entity_id === anchor.source_entity_id);
    const members = authoredFormation ? authoredFormation.member_ids.map((id) => value.entities.find((entity) => entity.id === id)).filter(Boolean) as typeof value.entities : [];
    const xs = [...new Set(members.map((entity) => entity.x))].sort((a, b) => a - b);
    const ys = [...new Set(members.map((entity) => entity.y))].sort((a, b) => a - b);
    return {
      id: anchor.id, source_entity_type: 'scout' as const, source_ship_type: anchor.source_ship_type, source_entity_id: anchor.source_entity_id,
      source_selector: { formation_index: Math.max(0, runtimeIndex), row: source ? Math.max(0, ys.indexOf(source.y)) : 0, column: source ? Math.max(0, xs.indexOf(source.x)) : 0 },
      interior: anchor.interior, entry_envelope: anchor.entry_envelope, offer_duration_ms: anchor.offer_duration_ms,
    };
  });
  return {
    id: value.id, slug: value.slug, name: value.name, version: value.version, schema_version: '1.0', status: value.status, sequence: value.sequence, seed: value.seed,
    player: { x: player.x, y: player.y }, enemy_formations, shields,
    hazards: value.hazard_emitters.filter((emitter) => emitter.enabled).map((emitter) => ({ type: emitter.hazard_type.toLowerCase() as 'asteroid' | 'comet', count: emitter.initial_count, speed: emitter.speed_min, origin: emitter.spawn_points[0] ?? { x: 640, y: 0 }, spacing: { x: 0, y: 0 }, emitter })),
    drop_tables: value.drop_rules.flatMap((rule) => rule.host_entity_types.map((host) => ({
      host: host.toLowerCase() as 'scout' | 'cruiser' | 'destroyer',
      entries: [{ pickup: rule.pickup_type.toLowerCase() as 'nuke' | 'life', weight: rule.probability, maximum_per_level: rule.maximum_per_level }],
    }))), performance_budget: { max_enemies: value.performance_budget.max_active_enemies },
    boarding_anchors,
  };
}
