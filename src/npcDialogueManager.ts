import { NPCQuoteComposer } from './npcQuoteComposer';
import { NpcBrain } from './types/npcBrain';
import { DancerBrain } from './dancerBrain';

export class NPCDialogueManager {
  private composer: NPCQuoteComposer;
  private activeNPC: string | null = null;
  private conversationHistory: string[] = [];
  private brains = new Map<string, NpcBrain>();

  constructor(jsonPath: string) {
    this.composer = new NPCQuoteComposer(jsonPath);
    this.brains.set('dancer', new DancerBrain());
  }

  async load(): Promise<void> {
    await this.composer.load();
  }

  startConversation(npcName: string): void {
    this.activeNPC = npcName;
    this.conversationHistory = [];
    this.brains.get(npcName)?.start();
  }

  endConversation(): void {
    this.activeNPC = null;
    this.conversationHistory = [];
  }

  getNPCResponse(playerInput: string): string {
    if (!this.activeNPC) {
      throw new Error('No NPC conversation started.');
    }

    let response: string;

    const brain = this.brains.get(this.activeNPC);
    if (brain) {
      response = brain.respond(playerInput, this.composer);
    } else {
      const chance = Math.random();
      response =
        chance > 0.5
          ? this.composer.getComposedQuote(2 + Math.floor(Math.random() * 2))
          : this.composer.getRandomQuote();
    }

    this.conversationHistory.push(`Player: ${playerInput}`);
    this.conversationHistory.push(`${this.activeNPC}: ${response}`);

    return response;
  }

  getHistory(): string[] {
    return [...this.conversationHistory];
  }
}
