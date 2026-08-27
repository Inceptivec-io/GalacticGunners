import type { LevelDefinition } from './LevelDefinition';
import { LEVEL_ONE_DEFINITION } from './levelOneDefinition';

function campaignLevel(sequence: number, seed: number): LevelDefinition {
  const columns = Math.min(29, 16 + sequence * 2);
  // Every packaged campaign level remains inside its own declared performance
  // ceiling while still changing topology deterministically from Level 2 onward.
  const rows = 2;
  return { ...LEVEL_ONE_DEFINITION, id: `level-0${sequence}`, slug: `level-0${sequence}`, name: `Level ${sequence}`, version: 1, status: 'DRAFT', sequence, seed,
    enemy_formations: [{ type: 'scout', rows, columns, origin: { x: 50, y: 120 }, spacing: { x: 40, y: 50 } }],
    performance_budget: { max_enemies: 58 }, drop_tables: [{ host: 'scout', entries: [{ pickup: 'nuke', weight: 1 }, { pickup: 'life', weight: 0.35 }] }],
    ...(sequence === 4 ? { boarding_anchors: [{ id: 'level-04-alien-frigate-01', source_selector: { formation_index: 0, row: 0, column: 14 }, source_entity_type: 'scout' as const, source_ship_type: 'ALIEN_FRIGATE' as const, source_entity_id: 'level-04:formation-0:r0:c14', interior: { slug: 'alien-frigate' as const, version: 1 as const, checksum: 'e9b1af65f0daef6725a7ddf4683b5f6d503e25dabc97aef1212102e6b1e994f3' }, entry_envelope: { width_px: 160 as const, height_px: 128 as const }, offer_duration_ms: 8000 as const }] } : {}),
  };
}

export const CAMPAIGN_DEFINITIONS: LevelDefinition[] = [LEVEL_ONE_DEFINITION, campaignLevel(2, 12002), campaignLevel(3, 12003), campaignLevel(4, 12004), campaignLevel(5, 12005), campaignLevel(6, 12006)];
