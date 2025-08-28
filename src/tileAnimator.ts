import { SpriteAnimator } from './spriteAnimator';
import { assets } from './assets';

export class TileAnimator {
  private animator: SpriteAnimator;

  constructor(
    public tileName: string,
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
    frameDuration: number = 0.3
  ) {
    const img = assets[tileName];
    if (!img) throw new Error(`Missing animated tile: ${tileName}`);
    this.animator = new SpriteAnimator(
      img,
      frameWidth,
      frameHeight,
      frameCount,
      frameDuration
    );
  }

  update(deltaTime: number): void {
    this.animator.update(deltaTime);
  }

  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void {
    this.animator.draw(ctx, x, y, size);
  }
}
