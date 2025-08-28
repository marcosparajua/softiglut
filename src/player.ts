import { InputHandler } from './inputHandler';
import { SpriteAnimator } from './spriteAnimator';
import { assets } from './assets';

type Direction = 'left' | 'right' | 'up' | 'down';

interface Animations {
  walk: { [key in Direction]: SpriteAnimator };
  idle: { [key in 'left' | 'right']: SpriteAnimator };
}

export class Player {
  public x = 0;
  public y = 0;
  private speed = 600;
  private soundtrackStarted = false;
  private direction: Direction = 'right';
  private isMoving = false;
  private inputEnabled = true;
  private animations: Animations;
  private currentAnimator: SpriteAnimator;

  constructor(
    private input: InputHandler,
    private horseSound: HTMLAudioElement,
    private soundtrack: HTMLAudioElement
  ) {
    this.animations = {
      walk: {
        left: new SpriteAnimator(
          assets['walk_left.png'] ??
            ((): never => {
              throw new Error('Missing asset: walk_left.png');
            })(),
          64,
          64,
          4,
          0.15
        ),
        right: new SpriteAnimator(
          assets['walk_right.png'] ??
            ((): never => {
              throw new Error('Missing asset: walk_right.png');
            })(),
          64,
          64,
          4,
          0.15
        ),
        up: new SpriteAnimator(
          assets['walk_up.png'] ??
            ((): never => {
              throw new Error('Missing asset: walk_up.png');
            })(),
          64,
          64,
          4,
          0.15
        ),
        down: new SpriteAnimator(
          assets['walk_down.png'] ??
            ((): never => {
              throw new Error('Missing asset: walk_down.png');
            })(),
          64,
          64,
          4,
          0.15
        ),
      },
      idle: {
        left: new SpriteAnimator(
          assets['idle_left.png'] ??
            ((): never => {
              throw new Error('Missing asset: idle_left.png');
            })(),
          64,
          64,
          4,
          0.4
        ),
        right: new SpriteAnimator(
          assets['idle_right.png'] ??
            ((): never => {
              throw new Error('Missing asset: idle_right.png');
            })(),
          64,
          64,
          4,
          0.4
        ),
      },
    };

    this.currentAnimator = this.animations.idle.right;
  }

  public setInputEnabled(v: boolean): void {
    this.inputEnabled = v;
  }

  update(dt: number): void {
    const moving = this.inputEnabled
      ? {
          up: this.input.isDown('w'),
          down: this.input.isDown('s'),
          left: this.input.isDown('a'),
          right: this.input.isDown('d'),
        }
      : { up: false, down: false, left: false, right: false };

    const wasMoving = this.isMoving;
    this.isMoving = Object.values(moving).some(Boolean);

    if (!this.soundtrackStarted && this.isMoving) {
      this.soundtrack
        .play()
        .catch(err => console.warn('Blocked soundtrack:', err));
      this.soundtrackStarted = true;
    }

    if (this.isMoving && !wasMoving) {
      this.horseSound.currentTime = 0;
      this.horseSound.play();
    } else if (!this.isMoving && wasMoving) {
      this.horseSound.pause();
    }

    if (moving.up) {
      this.y -= this.speed * dt;
      this.direction = 'up';
    } else if (moving.down) {
      this.y += this.speed * dt;
      this.direction = 'down';
    } else if (moving.left) {
      this.x -= this.speed * dt;
      this.direction = 'left';
    } else if (moving.right) {
      this.x += this.speed * dt;
      this.direction = 'right';
    }

    if (this.isMoving) {
      this.currentAnimator = this.animations.walk[this.direction];
      this.currentAnimator.update(dt);
    } else {
      if (this.direction === 'left' || this.direction === 'right') {
        this.currentAnimator = this.animations.idle[this.direction];
        this.currentAnimator.update(dt);
      }
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number
  ): void {
    this.currentAnimator.draw(ctx, screenX, screenY, 264);
  }
}
