import { SpriteAnimator } from './spriteAnimator';

export class Duck {
  private animator: SpriteAnimator;
  public audio?: HTMLAudioElement;

  constructor(
    image: HTMLImageElement,
    public worldX: number,
    public worldY: number,
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
    frameDuration: number = 0.15,
    public readonly name: string = 'NPC',
    audioPath?: string
  ) {
    this.animator = new SpriteAnimator(
      image,
      frameWidth,
      frameHeight,
      frameCount,
      frameDuration
    );

    if (audioPath) {
      this.audio = new Audio(audioPath);
      this.audio.loop = true;
      this.audio.volume = 0;
    }
  }

  update(dt: number): void {
    this.animator.update(dt);
  }

  render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    size: number
  ): void {
    const screenX = this.worldX - cameraX;
    const screenY = this.worldY - cameraY;
    this.animator.draw(ctx, screenX, screenY, size);
  }
}
