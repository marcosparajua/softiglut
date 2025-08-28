export class Renderer {
  constructor(public ctx: CanvasRenderingContext2D) {}

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawImage(img: HTMLImageElement, x: number, y: number, size: number): void {
    this.ctx.drawImage(img, x, y, size, size);
  }
}
