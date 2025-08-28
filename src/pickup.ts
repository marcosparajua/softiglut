import { SpriteAnimator } from './spriteAnimator';
import { assets } from './assets';

export class Pickup {
  private animator: SpriteAnimator;
  public collected = false;

  constructor(
    public id: string,
    public tileX: number,
    public tileY: number,
    spriteSheet: string,
    frameCount: number,
    frameW = 64,
    frameH = 64,
    frameTime = 0.08
  ) {
    const img = assets[spriteSheet];
    if (!img) throw new Error(`Pickup sprite missing: ${spriteSheet}`);
    this.animator = new SpriteAnimator(
      img,
      frameW,
      frameH,
      frameCount,
      frameTime
    );
  }

  update(dt: number): void {
    if (!this.collected) this.animator.update(dt);
  }

  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    tileSize: number
  ): void {
    if (this.collected) return;
    const screenX = this.tileX * tileSize - cameraX;
    const screenY = this.tileY * tileSize - cameraY;
    this.animator.draw(ctx, screenX, screenY, tileSize);
  }

  isAt(tx: number, ty: number): boolean {
    return !this.collected && this.tileX === tx && this.tileY === ty;
  }

  collect(): void {
    this.collected = true;
  }
}
