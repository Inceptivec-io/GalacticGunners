export interface InputCapabilities {
  keyboard: boolean;
  pointer: boolean;
  touch: boolean;
  gamepad: boolean;
}

export const DEFAULT_INPUT_CAPABILITIES: InputCapabilities = {
  keyboard: true,
  pointer: true,
  touch: true,
  gamepad: true,
};

export function mergeInputCapabilities(
  overrides: Partial<InputCapabilities> = {},
): InputCapabilities {
  return {
    ...DEFAULT_INPUT_CAPABILITIES,
    ...overrides,
  };
}
