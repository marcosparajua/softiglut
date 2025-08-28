import { Renderer } from './renderer';
import { InputHandler } from './inputHandler';
import { Scene } from './scene';
import { FaceFilterOverlay } from './faceFilterOverlay';
import { WorldMap } from './worldMap';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;
  private input: InputHandler;
  private scene: Scene;
  private lastTime = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private horseSound: HTMLAudioElement,
    private soundtrack: HTMLAudioElement,
    private world: WorldMap
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.renderer = new Renderer(this.ctx);
    this.input = new InputHandler();
    this.scene = new Scene(
      this.input,
      this.horseSound,
      this.soundtrack,
      this.world
    );

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  public setFaceOverlay(overlay: FaceFilterOverlay): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).scene?.setFaceOverlay?.(overlay);
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public start(): void {
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(time: number): void {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.scene.update(dt);
    this.renderer.clear();
    this.scene.render(this.renderer);

    requestAnimationFrame(this.loop.bind(this));
  }
}
