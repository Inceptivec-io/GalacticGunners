import type * as Phaser from 'phaser';

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

export class InputSystem {
  readonly #cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  readonly #keys: Record<'a' | 'd' | 'w' | 'm' | 'enter' | 'escape', Phaser.Input.Keyboard.Key | undefined>;
  readonly #pointerState = { left: false, right: false, fire: false };
  readonly #gamepadPlugin: Phaser.Input.Gamepad.GamepadPlugin | null | undefined;
  #mutePressed = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.#cursors = scene.input.keyboard?.createCursorKeys();
    this.#keys = {
      a: scene.input.keyboard?.addKey('A'),
      d: scene.input.keyboard?.addKey('D'),
      w: scene.input.keyboard?.addKey('W'),
      m: scene.input.keyboard?.addKey('M'),
      enter: scene.input.keyboard?.addKey('ENTER'),
      escape: scene.input.keyboard?.addKey('ESC'),
    };
    this.#gamepadPlugin = scene.input.gamepad;

    scene.input.on('pointerdown', this.handlePointerDown, this);
    scene.input.on('pointermove', this.handlePointerMove, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
    scene.events.once('shutdown', () => this.destroy());
  }

  get actions(): ActionState {
    const buttons = this.#gamepadPlugin?.getPad(0)?.buttons ?? [];
    const axes = this.#gamepadPlugin?.getPad(0)?.axes.map((axis) => axis.getValue()) ?? [];
    const gamepadButtons = normalizeGamepadButtons(buttons);
    const gamepadAxes = normalizeGamepadAxes(axes);

    return {
      left: Boolean(this.#cursors?.left.isDown || this.#keys.a?.isDown || this.#pointerState.left || gamepadButtons.left || gamepadAxes.left),
      right: Boolean(this.#cursors?.right.isDown || this.#keys.d?.isDown || this.#pointerState.right || gamepadButtons.right || gamepadAxes.right),
      fire: Boolean(this.#cursors?.space.isDown || this.#keys.w?.isDown || this.#pointerState.fire || gamepadButtons.fire),
      confirm: Boolean(this.#keys.enter?.isDown || this.#cursors?.space.isDown || this.#pointerState.fire || gamepadButtons.confirm),
      back: Boolean(this.#keys.escape?.isDown || gamepadButtons.back),
    };
  }

  consumeMuteToggle(): boolean {
    const isDown = Boolean(this.#keys.m?.isDown);
    const toggled = isDown && !this.#mutePressed;
    this.#mutePressed = isDown;
    return toggled;
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    this.updatePointer(pointer);
    this.#pointerState.fire = true;
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.isDown) {
      this.updatePointer(pointer);
    }
  }

  private handlePointerUp(): void {
    this.#pointerState.left = false;
    this.#pointerState.right = false;
    this.#pointerState.fire = false;
  }

  private updatePointer(pointer: Phaser.Input.Pointer): void {
    const center = this.scene.scale.width / 2;
    this.#pointerState.left = pointer.x < center - 28;
    this.#pointerState.right = pointer.x > center + 28;
  }
}
