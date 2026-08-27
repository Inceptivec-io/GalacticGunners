import { BoardingStateMachine } from './BoardingStateMachine';
import type { BoardingOutcome, BoardingResources, BoardingSnapshot } from './types';
import { digestBoardingSnapshot } from './snapshot';

export interface BoardingOffer {
  anchorId: string;
  sourceEntityId: string;
  resources: BoardingResources;
  snapshot: BoardingSnapshot;
}

/**
 * Owns the shooter-to-boarding boundary.  Phaser scenes receive only an offer
 * and a terminal result; neither scene may directly mutate campaign score.
 */
export class BoardingCoordinator {
  private readonly machine = new BoardingStateMachine();
  private offer: BoardingOffer | null = null;

  async open(offer: BoardingOffer): Promise<{ shooterStateDigest: string }> {
    if (this.offer) throw new Error('A Boarding offer is already active.');
    this.offer = offer;
    return { shooterStateDigest: await digestBoardingSnapshot(offer.snapshot) };
  }

  accept(): void {
    this.requireOffer();
    this.machine.transition('ACTIVE');
  }

  reject(): BoardingOffer {
    const offer = this.requireOffer();
    this.machine.transition('REJECTED');
    this.offer = null;
    return offer;
  }

  complete(outcome: BoardingOutcome, resources: BoardingResources): { offer: BoardingOffer; outcome: BoardingOutcome; resources: BoardingResources } {
    const offer = this.requireOffer();
    if (this.machine.state !== 'ACTIVE') throw new Error('Boarding is not active.');
    this.machine.transition('COMPLETING');
    this.machine.transition('RETURNED');
    this.offer = null;
    return { offer, outcome, resources: { lives: Math.min(3, Math.max(0, resources.lives)), nukes: Math.min(2, Math.max(0, resources.nukes)) } };
  }

  get state(): string { return this.machine.state; }

  private requireOffer(): BoardingOffer {
    if (!this.offer) throw new Error('No Boarding offer is active.');
    return this.offer;
  }
}
