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
    if (formation.type !== 'scout' || formation.rows < 1 || formation.columns < 1 || formation.origin.x < 0 || formation.origin.y < 0) throw new Error('Invalid enemy formation.');
  }
  for (const shield of level.shields) {
    if (!Number.isInteger(shield.count) || shield.count < 0 || shield.matrix.some((row) => row.some((tile) => tile !== 0 && tile !== 1))) throw new Error('Invalid shield matrix.');
  }
}
