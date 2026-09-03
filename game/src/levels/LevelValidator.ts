import type { LevelDefinition } from './LevelDefinition';

const prohibited = /<|>|javascript:|\b(?:function|script|select|insert|delete|drop|eval|process|require)\b/i;

export function validateLevelDefinition(value: unknown): asserts value is LevelDefinition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Level definition must be an object.');
  const level = value as Partial<LevelDefinition>;
  if (level.schema_version !== '1.0' || !/^[a-z0-9-]{3,64}$/.test(level.slug ?? '')) throw new Error('Invalid level identity.');
  if (JSON.stringify(level).length > 100_000 || prohibited.test(JSON.stringify(level))) throw new Error('Unsafe level definition.');
  if (!Array.isArray(level.enemy_formations) || !Array.isArray(level.shields) || !level.performance_budget) throw new Error('Incomplete level definition.');
  const enemies = level.enemy_formations.reduce((sum, formation) => sum + formation.rows * formation.columns, 0);
  if (!Number.isInteger(enemies) || enemies < 1 || enemies > level.performance_budget.max_enemies) throw new Error('Enemy performance budget exceeded.');
  for (const formation of level.enemy_formations) {
    if (!['scout', 'cruiser', 'destroyer', 'mothership'].includes(formation.type) || formation.rows < 1 || formation.columns < 1 || formation.origin.x < 0 || formation.origin.y < 0) throw new Error('Invalid enemy formation.');
  }
  for (const hazard of level.hazards ?? []) {
    // A configured emitter may deliberately begin empty and introduce hazards on
    // its authored schedule. Zero initial instances is therefore valid.
    if (!['asteroid', 'comet'].includes(hazard.type) || !Number.isInteger(hazard.count) || hazard.count < 0 || hazard.count > 12 || hazard.speed <= 0 || hazard.origin.x < 0 || hazard.origin.y < 0) throw new Error('Invalid hazard definition.');
  }
  for (const shield of level.shields) {
    if (!Number.isInteger(shield.count) || shield.count < 0 || shield.matrix.some((row) => row.some((tile) => tile !== 0 && tile !== 1))) throw new Error('Invalid shield matrix.');
  }
  if (level.drop_tables !== undefined) {
    if (!Array.isArray(level.drop_tables)) throw new Error('Invalid pickup tables.');
    for (const table of level.drop_tables) {
      if (!['scout', 'cruiser', 'destroyer'].includes(table.host)
        || !Array.isArray(table.entries)
        || table.entries.length === 0) {
        throw new Error('Invalid pickup table.');
      }
      for (const entry of table.entries) {
        if (!['nuke', 'life'].includes(entry.pickup)
          || !Number.isFinite(entry.weight)
          || entry.weight <= 0
          || (entry.maximum_per_level !== undefined
            && (!Number.isInteger(entry.maximum_per_level) || entry.maximum_per_level < 1))) {
          throw new Error('Invalid pickup entry.');
        }
      }
    }
  }
  if (level.boarding_anchors) {
    if (level.boarding_anchors.length > 1) throw new Error('A level can have at most one Boarding anchor.');
    for (const anchor of level.boarding_anchors) {
      const expected = `${level.slug}:formation-${anchor.source_selector.formation_index}:r${anchor.source_selector.row}:c${anchor.source_selector.column}`;
      const selectedFormation = level.enemy_formations[anchor.source_selector.formation_index];
      if (!['scout', 'cruiser', 'destroyer'].includes(anchor.source_entity_type) || anchor.source_ship_type !== 'ALIEN_FRIGATE'
        || (anchor.source_entity_id !== expected && selectedFormation?.entity_id !== anchor.source_entity_id) || anchor.offer_duration_ms !== 8000
        || anchor.entry_envelope.width_px !== 160 || anchor.entry_envelope.height_px !== 128
        || !/^[0-9a-f]{64}$/.test(anchor.interior.checksum)) {
        throw new Error('Invalid Boarding anchor.');
      }
    }
  }
}
