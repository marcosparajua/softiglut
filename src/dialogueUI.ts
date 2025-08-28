import { InputHandler } from './inputHandler';

type Page = { text: string; lines: string[] };

export class DialogueUI {
  private active = false;
  private npcName = '';
  private rawText = '';
  private pages: Page[] = [];
  private pageIndex = 0;

  private revealChars = 0;
  private charsPerSecond = 55;
  private lineHeight = 28;
  private padding = 22;
  private boxHeight = 156;
  private textTopGap = 10;

  private font = "16px 'Public Pixel', sans-serif";
  private nameFont = "bold 16px 'Public Pixel', sans-serif";
  private inputFont = "bold 16px 'Public Pixel', sans-serif";

  private typingMode = false;
  private typedText = '';
  private submitted: string | null = null;

  constructor(private input: InputHandler) {}

  open(npcName: string, text: string): void {
    this.active = true;
    this.npcName = npcName;
    this.rawText = text;
    this.pages = [];
    this.pageIndex = 0;
    this.revealChars = 0;
  }

  close(): void {
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  isTyping(): boolean {
    return this.typingMode;
  }

  pollSubmittedText(): string | null {
    const t = this.submitted;
    this.submitted = null;
    return t;
  }

  update(dt: number): void {
    if (!this.active) return;

    if (this.typingMode) return;

    this.revealChars += this.charsPerSecond * dt;

    const pressed =
      this.input.isDown(' ') ||
      this.input.isDown('Enter') ||
      this.input.isDown('z');

    if (pressed) {
      const fullLen = this.currentPageFullText().length;

      if (this.revealChars < fullLen) {
        this.revealChars = fullLen;
      } else {
        if (this.pageIndex < this.pages.length - 1) {
          this.pageIndex++;
          this.revealChars = 0;
        } else {
          this.close();
        }
      }
    }
  }

  enableTyping(): void {
    this.typingMode = true;
    this.typedText = '';
    window.addEventListener('keydown', this.handleTyping);
  }

  disableTyping(): void {
    this.typingMode = false;
    window.removeEventListener('keydown', this.handleTyping);
  }

  private handleTyping = (e: KeyboardEvent): void => {
    if (!this.typingMode) return;

    if (e.key === 'Backspace' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
    }

    if (e.key === 'Backspace') {
      this.typedText = this.typedText.slice(0, -1);
      return;
    }

    if (e.key === 'Enter') {
      this.submitted = this.typedText.trim();
      this.disableTyping();
      return;
    }

    if (e.key === ' ') {
      this.typedText += ' ';
      return;
    }

    if (e.key.length === 1) {
      this.typedText += e.key;
    }
  };

  getTypedText(): string {
    return this.typedText;
  }

  render(
    ctx: CanvasRenderingContext2D,
    screenW: number,
    screenH: number
  ): void {
    if (!this.active) {
      if (this.typingMode) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#222';
        ctx.fillRect(50, screenH - 80, screenW - 100, 40);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(50, screenH - 80, screenW - 100, 40);
        ctx.fillStyle = '#fff';
        ctx.font = this.inputFont;
        ctx.textBaseline = 'middle';
        ctx.fillText(this.typedText + '_', 60, screenH - 60);
        ctx.restore();
      }
      return;
    }

    if (this.pages.length === 0) {
      this.computePages(ctx, screenW);
    }
    const x = this.padding;
    const w = screenW - this.padding * 2;
    const h = this.boxHeight;
    const y = screenH - h - this.padding;

    ctx.save();

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#111';
    this.roundRect(ctx, x, y, w, h, 10);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ffffff55';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, w, h, 10);
    ctx.stroke();

    ctx.font = this.nameFont;
    ctx.fillStyle = '#fff';
    const namePadX = 14;
    const namePadY = 8;
    ctx.fillText(this.npcName, x + namePadX, y + namePadY + 14);

    const innerX = x + this.padding;
    const innerY = y + this.padding + 24 + this.textTopGap;
    ctx.font = this.font;
    ctx.fillStyle = '#eee';
    const page = this.pages[this.pageIndex];
    if (page) {
      const visible = page.text.slice(0, Math.floor(this.revealChars));
      let cursor = 0;
      let drawY = innerY;
      for (const line of page.lines) {
        const take = Math.max(
          0,
          Math.min(line.length, visible.length - cursor)
        );
        const part = line.slice(0, take);
        ctx.fillText(part, innerX, drawY);
        cursor += line.length + 1;
        drawY += this.lineHeight;
      }

      const fullLen = page.text.length;
      if (this.revealChars >= fullLen) {
        const hasMore = this.pageIndex < this.pages.length - 1;
        const indicator = hasMore ? '▶' : '■';
        ctx.globalAlpha = 0.85;
        ctx.fillText(indicator, x + w - 24, y + h - 12);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();

    if (this.typingMode) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#222';
      ctx.fillRect(50, screenH - 80, screenW - 100, 40);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(50, screenH - 80, screenW - 100, 40);

      ctx.fillStyle = '#fff';
      ctx.font = this.inputFont;
      ctx.textBaseline = 'middle';
      ctx.fillText(this.typedText + '_', 60, screenH - 60);
      ctx.restore();
    }
  }

  private currentPageFullText(): string {
    if (!this.pages.length || !this.pages[this.pageIndex]) return '';
    const page = this.pages[this.pageIndex];
    return page ? page.text : '';
  }

  private computePages(ctx: CanvasRenderingContext2D, screenW: number): void {
    ctx.save();
    ctx.font = this.font;

    const w = screenW - this.padding * 2;
    const innerW = w - this.padding * 2;
    const innerH = this.boxHeight - this.padding * 2 - 24;
    const linesPerPage = Math.max(1, Math.floor(innerH / this.lineHeight));

    const words = this.rawText.split(/\s+/);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width <= innerW) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);

    const pages: Page[] = [];
    for (let i = 0; i < lines.length; i += linesPerPage) {
      const chunk = lines.slice(i, i + linesPerPage);
      pages.push({
        lines: chunk,
        text: chunk.join('\n'),
      });
    }

    this.pages = pages.length ? pages : [{ lines: [''], text: '' }];
    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
