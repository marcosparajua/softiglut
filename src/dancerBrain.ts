import { NpcBrain } from './types/npcBrain';
import { NPCQuoteComposer } from './npcQuoteComposer';

enum DancerState {
  intro = 'intro',
  hintNorth = 'hintNorth',
  hintRoot = 'hintRoot',
  request = 'request',
  accepted = 'accepted',
  complete = 'complete',
}

export class DancerBrain implements NpcBrain {
  id = 'dancer';
  private state: DancerState = DancerState.intro;

  start(): void {
    if (this.state === DancerState.intro) return;
  }

  respond(input: string, composer: NPCQuoteComposer): string {
    const text = input.toLowerCase();

    switch (this.state) {
      case DancerState.intro: {
        const flavor = composer.getComposedQuote(2);
        this.state = DancerState.hintNorth;
        return `This world is a real mess. ${flavor}`;
      }

      case DancerState.hintNorth: {
        if (includesAny(text, ['north', 'up'])) {
          this.state = DancerState.hintRoot;
          const flavor = composer.getRandomQuote();
          return `You may as well look north. ${flavor}`;
        }

        const flavor = composer.getComposedQuote(2);
        return `Directions matter. ${flavor}`;
      }

      case DancerState.hintRoot: {
        if (
          includesAny(text, [
            'tree',
            'root',
            'trees',
            'roots',
            'plants',
            'plant',
          ])
        ) {
          this.state = DancerState.request;
          const flavor = composer.getComposedQuote(2);
          return `It will look like someone walked. A root. ${flavor}`;
        }
        const flavor = composer.getRandomQuote();
        return `Look for signs in the ground. ${flavor}`;
      }

      case DancerState.request: {
        if (
          includesAny(text, ['ok', 'okay', 'yes', 'sure', 'i will', 'accept'])
        ) {
          this.state = DancerState.accepted;

          const flavor = composer.getComposedQuote(2);

          return `It's beautiful. ${flavor}`;
        }
        const flavor = composer.getRandomQuote();
        return `You've certainly changed. I haven't. go north, take the root. ${flavor}`;
      }

      case DancerState.accepted: {
        this.state = DancerState.complete;
        const flavor = composer.getComposedQuote(2);
        return `Just one way, in and back out. ${flavor}`;
      }

      case DancerState.complete: {
        return `Let´s see what it remembers.`;
      }
    }
  }
}

const includesAny = (haystack: string, needles: string[]): boolean => {
  return needles.some(needle => haystack.includes(needle));
};
