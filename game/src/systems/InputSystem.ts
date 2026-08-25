import type * as Phaser from 'phaser';

export interface ActionState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
  nuke: boolean;
  pause: boolean;
  confirm: boolean;
  back: boolean;
}

export const EMPTY_ACTION_STATE: ActionState = {
  left: false,
  right: false,
  up: false,
  down: false,
  fire: false,
  nuke: false,
  pause: false,
  confirm: false,
  back: false,
};

export function normalizeGamepadButtons(buttons: readonly { pressed: boolean }[] = []): ActionState {
  return {
    ...EMPTY_ACTION_STATE,
    fire: Boolean(buttons[0]?.pressed),
    nuke: Boolean(buttons[3]?.pressed),
    pause: Boolean(buttons[9]?.pressed),
    confirm: Boolean(buttons[0]?.pressed || buttons[9]?.pressed),
    back: Boolean(buttons[1]?.pressed || buttons[8]?.pressed),
    left: Boolean(buttons[14]?.pressed),
    right: Boolean(buttons[15]?.pressed),
    up: Boolean(buttons[12]?.pressed),
    down: Boolean(buttons[13]?.pressed),
  };
}

export function normalizeGamepadAxes(axes: readonly number[] = [], deadzone = 0.35): Pick<ActionState, 'left' | 'right' | 'up' | 'down'> {
  const axisX = axes[0] ?? 0;
  const axisY = axes[1] ?? 0;
  return {
    left: axisX < -deadzone,
    right: axisX > deadzone,
    up: axisY < -deadzone,
    down: axisY > deadzone,
  };
}

export class InputSystem {
  readonly #cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  readonly #keys: Record<'a' | 'd' | 'w' | 's' | 'm' | 'n' | 'p' | 'enter' | 'escape', Phaser.Input.Keyboard.Key | undefined>;
  readonly #pointerState = { left: false, right: false, up: false, down: false, fire: false };
  readonly #gamepadPlugin: Phaser.Input.Gamepad.GamepadPlugin | null | undefined;
  #mutePressed = false;
  #nukePressed = false;
  #pausePressed = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.#cursors = scene.input.keyboard?.createCursorKeys();
    this.#keys = {
      a: scene.input.keyboard?.addKey('A'),
      d: scene.input.keyboard?.addKey('D'),
      w: scene.input.keyboard?.addKey('W'),
      s: scene.input.keyboard?.addKey('S'),
      m: scene.input.keyboard?.addKey('M'),
      n: scene.input.keyboard?.addKey('N'),
      p: scene.input.keyboard?.addKey('P'),
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
      up: Boolean(this.#cursors?.up.isDown || this.#keys.w?.isDown || this.#pointerState.up || gamepadButtons.up || gamepadAxes.up),
      down: Boolean(this.#cursors?.down.isDown || this.#keys.s?.isDown || this.#pointerState.down || gamepadButtons.down || gamepadAxes.down),
      fire: Boolean(this.#cursors?.space.isDown || this.#pointerState.fire || gamepadButtons.fire),
      nuke: Boolean(this.#keys.n?.isDown || gamepadButtons.nuke),
      pause: Boolean(this.#keys.p?.isDown || gamepadButtons.pause),
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

  consumeNuke(): boolean {
    const isDown = this.actions.nuke;
    const consumed = isDown && !this.#nukePressed;
    this.#nukePressed = isDown;
    return consumed;
  }

  consumePauseToggle(): boolean {
    const isDown = this.actions.pause;
    const consumed = isDown && !this.#pausePressed;
    this.#pausePressed = isDown;
    return consumed;
  }

  syncOneShotState(): void {
    const actions = this.actions;
    this.#mutePressed = Boolean(this.#keys.m?.isDown);
    this.#nukePressed = actions.nuke;
    this.#pausePressed = actions.pause;
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
    this.#pointerState.up = false;
    this.#pointerState.down = false;
    this.#pointerState.fire = false;
  }

  resetPointerState(): void {
    this.handlePointerUp();
  }

  private updatePointer(pointer: Phaser.Input.Pointer): void {
    const center = this.scene.scale.width / 2;
    const verticalCenter = this.scene.scale.height * 0.72;
    this.#pointerState.left = pointer.x < center - 28;
    this.#pointerState.right = pointer.x > center + 28;
    this.#pointerState.up = pointer.y < verticalCenter - 28;
    this.#pointerState.down = pointer.y > verticalCenter + 28;
  }
}
