import { NPCQuoteComposer } from '../npcQuoteComposer';

export interface NpcBrain {
  id: string;

  start(): void;

  respond(playerInput: string, composer: NPCQuoteComposer): string;
}
