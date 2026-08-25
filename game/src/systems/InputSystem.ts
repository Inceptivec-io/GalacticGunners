export interface ActionState {
  left: boolean;
  right: boolean;
  fire: boolean;
  confirm: boolean;
  back: boolean;
}

export const EMPTY_ACTION_STATE: ActionState = {
  left: false,
  right: false,
  fire: false,
  confirm: false,
  back: false,
};

export function normalizeGamepadButtons(buttons: readonly { pressed: boolean }[] = []): ActionState {
  return {
    ...EMPTY_ACTION_STATE,
    fire: Boolean(buttons[0]?.pressed || buttons[2]?.pressed),
    confirm: Boolean(buttons[0]?.pressed || buttons[9]?.pressed),
    back: Boolean(buttons[1]?.pressed || buttons[8]?.pressed),
    left: Boolean(buttons[14]?.pressed),
    right: Boolean(buttons[15]?.pressed),
  };
}

export function normalizeGamepadAxes(axes: readonly number[] = [], deadzone = 0.35): Pick<ActionState, 'left' | 'right'> {
  const axis = axes[0] ?? 0;
  return {
    left: axis < -deadzone,
    right: axis > deadzone,
  };
}
