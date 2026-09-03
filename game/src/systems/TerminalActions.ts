export type TerminalState = 'complete' | 'failed';
export type TerminalPrimaryAction = 'continue' | 'replay' | 'try-again';

export interface TerminalActionContext {
  terminalState: TerminalState;
  hasNextEntry: boolean;
  offline: boolean;
  sequence: number;
  campaignLength: number;
}

/**
 * Continue is an entitlement supplied by the pinned campaign run. Packaged
 * offline play may advance only within its authored campaign boundary.
 */
export function primaryTerminalAction(context: TerminalActionContext): TerminalPrimaryAction {
  if (context.terminalState === 'failed') {
    return 'try-again';
  }
  const offlineNextEntry = context.offline && context.sequence < context.campaignLength;
  return context.hasNextEntry || offlineNextEntry ? 'continue' : 'replay';
}
