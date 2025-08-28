export class SpriteAnimator {
  private currentFrame = 0;
  private currentTime = 0;

  constructor(
    private image: HTMLImageElement,
    private frameWidth: number,
    private frameHeight: number,
    private frameCount: number,
    private frameTime: number
  ) {}
  update(dt: number): void {
    this.currentTime += dt;
    if (this.currentTime >= this.frameTime) {
      this.currentTime = 0;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void {
    ctx.drawImage(
      this.image,
      this.currentFrame * this.frameWidth,
      0,
      this.frameWidth,
      this.frameHeight,
      x,
      y,
      size,
      size
    );
  }

  reset(): void {
    this.currentFrame = 0;
    this.currentTime = 0;
  }

  setImage(image: HTMLImageElement): void {
    this.image = image;
    this.reset();
  }
}
