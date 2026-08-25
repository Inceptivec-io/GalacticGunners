export type AudioCue =
  | 'uiConfirm'
  | 'uiSelect'
  | 'playerLaser'
  | 'enemyLaser'
  | 'explosionSmall'
  | 'playerHit';

export class AudioSystem {
  #muted = false;

  constructor(private readonly playCue: (cue: AudioCue) => void) {}

  get muted(): boolean {
    return this.#muted;
  }

  toggleMute(): boolean {
    this.#muted = !this.#muted;
    return this.#muted;
  }

  play(cue: AudioCue): void {
    if (!this.#muted) {
      this.playCue(cue);
    }
  }
}
