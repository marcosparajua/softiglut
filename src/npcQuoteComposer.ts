export class NPCQuoteComposer {
  private data: Record<string, string[]> = {};

  constructor(private jsonPath: string) {}

  async load(): Promise<void> {
    const response = await fetch(this.jsonPath);
    if (!response.ok) {
      throw new Error('Failed to load NPC quotes');
    }
    this.data = await response.json();
  }

  getRandomQuote(): string {
    const authors = Object.keys(this.data);

    if (authors.length === 0) {
      return '';
    }

    const author = authors[Math.floor(Math.random() * authors.length)];
    if (!author || !this.data[author] || this.data[author].length === 0) {
      return '';
    }
    const quotes = this.data[author];
    return quotes[Math.floor(Math.random() * quotes.length)] ?? '';
  }

  getComposedQuote(parts: number = 2): string {
    if (Object.keys(this.data).length === 0) {
      return '';
    }

    const segments: string[] = [];

    for (let i = 0; i < parts; i++) {
      const authors = Object.keys(this.data);
      const author = authors[Math.floor(Math.random() * authors.length)];
      if (!author || !this.data[author] || this.data[author].length === 0) {
        continue;
      }
      const quotes = this.data[author];
      const quote = quotes[Math.floor(Math.random() * quotes.length)] ?? '';
      segments.push(this.trimToSegment(quote));
    }
    return segments.join(' ');
  }

  private trimToSegment(quote: string): string {
    const words = quote.split(' ');
    const start = Math.floor(Math.random() * Math.max(1, words.length - 4));
    const end = Math.min(
      words.length,
      start + Math.floor(4 + Math.random() * 5)
    );
    return words.slice(start, end).join(' ');
  }
}
