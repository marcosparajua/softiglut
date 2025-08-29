/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpriteAnimator } from './spriteAnimator';

type MPFaceLandmarker = any;

export class FaceFilterOverlay {
  private maskAnimator: SpriteAnimator | null = null;
  private readonly eyeLeftOuter = 33;
  private readonly eyeRightOuter = 263;
  private smoothed = { cx: 0, cy: 0, scale: 0, angle: 0, ready: false };
  private smoothFactor = 0.25;
  private holdFramesLeft = 0;
  private maskScale = 2.8;
  private maskYOffset = -0.15;
  private maskXOffsetPx = 0;
  private readonly maxHoldFrames = 6;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private overlayElement: HTMLElement;
  private running = false;

  private rafId: number | null = null;
  private lastVideoTime = -1;
  private frameSkip = 0;
  private detectEveryNFrames = 1;
  private landmarker: MPFaceLandmarker | null = null;

  private maskImage = new Image();
  private maskLoaded = false;
  private initialized = false;

  constructor(
    private modelUrl: string = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task'
  ) {
    const overlay = document.querySelector(
      '.face-overlay'
    ) as HTMLElement | null;
    const canvas = document.getElementById(
      'faceCanvas'
    ) as HTMLCanvasElement | null;
    if (!overlay || !canvas) {
      throw new Error(
        'Overlay or canvas element not found (need .face-overlay and #faceCanvas)'
      );
    }
    this.overlayElement = overlay;
    this.canvas = canvas;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas 2D context');
    this.context = ctx;

    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.autoplay = true;

    const maskSheet = new Image();
    maskSheet.src = 'assets/clown.png';
    maskSheet.onload = (): void => {
      this.maskAnimator = new SpriteAnimator(maskSheet, 128, 128, 6, 0.3);
    };
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    let FaceLandmarker: any, FilesetResolver: any;
    try {
      ({ FaceLandmarker, FilesetResolver } = await import(
        '@mediapipe/tasks-vision'
      ));
    } catch {
      throw new Error(
        'Failed to load @mediapipe/tasks-vision. Is it installed?'
      );
    }

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.4/wasm'
    );

    this.landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: this.modelUrl,
      },
      runningMode: 'VIDEO',
      numFaces: 1,
    });

    let stream: MediaStream;

    this.canvas.width = 160;
    this.canvas.height = 120;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 128 },
          height: { ideal: 96 },
          facingMode: 'user',
        },
        audio: false,
      });
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        throw new Error('Camera permission was denied.');
      }
      throw new Error('Unable to access camera.');
    }

    this.video.srcObject = stream;

    await new Promise<void>(resolve => {
      const onMeta = (): void => {
        this.video.removeEventListener('loadedmetadata', onMeta);
        resolve();
      };
      if (this.video.readyState >= 1) resolve();
      else this.video.addEventListener('loadedmetadata', onMeta);
    });

    try {
      await this.video.play();
    } catch {
      throw new Error(
        'Failed to start video playback (user gesture may be required).'
      );
    }

    this.initialized = true;
  }

  async show(): Promise<void> {
    await this.init();
    this.overlayElement.style.display = 'block';
    if (!this.running) {
      this.running = true;
      this.lastVideoTime = -1;
      this.loop();
    }
  }

  hide(): void {
    this.overlayElement.style.display = 'none';
    this.running = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  async destroy(): Promise<void> {
    this.hide();
    const stream = this.video.srcObject as MediaStream | null;
    stream?.getTracks().forEach(t => t.stop());
    this.video.srcObject = null;
    this.landmarker?.close?.();
    this.landmarker = null;
    this.initialized = false;
  }

  private loop = (): void => {
    if (!this.running) return;

    this.context.save();
    this.context.translate(this.canvas.width, 0);
    this.context.scale(-1, 1);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      this.video,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    const vt = this.video.currentTime;

    if (this.landmarker && vt !== this.lastVideoTime) {
      this.frameSkip = (this.frameSkip + 1) % this.detectEveryNFrames;
      if (this.frameSkip === 0) {
        const res = this.landmarker.detectForVideo(
          this.video,
          performance.now()
        );
        const face = res?.faceLandmarks?.[0];

        if (face) {
          this.updatePoseFromLandmarks(face);
          this.holdFramesLeft = this.maxHoldFrames;
        } else if (this.holdFramesLeft > 0) {
          this.holdFramesLeft--;
        }
      }

      this.lastVideoTime = vt;
    }

    if (this.smoothed.ready && this.holdFramesLeft > 0) {
      this.drawSmoothedMask();
    }

    if (this.maskAnimator) {
      this.maskAnimator.update(1 / 60);
      this.drawMaskFromAnimator();
    }
    this.context.restore();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private drawMaskFromAnimator(): void {
    if (!this.maskAnimator) return;
    const { cx, cy, scale, angle } = this.smoothed;
    const W = this.canvas.width;

    const mx = W - cx + this.maskXOffsetPx;
    const mirroredAngle = -angle;

    this.context.save();
    this.context.translate(mx, cy);
    this.context.rotate(mirroredAngle);

    this.maskAnimator.draw(this.context, -scale / 2, -scale / 2, scale);
    this.context.restore();
  }

  private updatePoseFromLandmarks(
    landmarks: Array<{ x: number; y: number; z: number }>
  ): void {
    const W = this.canvas.width;
    const H = this.canvas.height;

    const L = landmarks[this.eyeLeftOuter];
    const R = landmarks[this.eyeRightOuter];
    if (!L || !R) return;

    const Lx = L.x * W,
      Ly = L.y * H;
    const Rx = R.x * W,
      Ry = R.y * H;

    const cx = (Lx + Rx) * 0.5;
    const cy = (Ly + Ry) * 0.5;

    const angle = Math.atan2(Ry - Ly, Rx - Lx);
    const eyeDist = Math.hypot(Rx - Lx, Ry - Ly);

    const faceH = eyeDist * 2.0;

    const target = {
      cx,
      cy: cy + this.maskYOffset * faceH,
      scale: this.maskScale * eyeDist,
      angle,
    };

    if (!this.smoothed.ready) {
      this.smoothed = { ...target, ready: true };
    } else {
      const a = this.smoothFactor,
        b = 1 - a;
      this.smoothed.cx = a * target.cx + b * this.smoothed.cx;
      this.smoothed.cy = a * target.cy + b * this.smoothed.cy;
      this.smoothed.scale = a * target.scale + b * this.smoothed.scale;
      this.smoothed.angle = a * target.angle + b * this.smoothed.angle;
    }
  }

  private drawSmoothedMask(): void {
    if (!this.maskLoaded) return;
    const W = this.canvas.width;

    const { cx, cy, scale, angle } = this.smoothed;

    const mx = W - cx + this.maskXOffsetPx;
    const mirroredAngle = -angle;

    this.context.save();
    this.context.translate(mx, cy);
    this.context.rotate(mirroredAngle);

    const w = scale;
    const h = scale;
    this.context.drawImage(this.maskImage, -w / 2, -h / 2, w, h);
    this.context.restore();
  }
}
