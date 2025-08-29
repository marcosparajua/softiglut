import { InputHandler } from './inputHandler';
import { Renderer } from './renderer';
import { assets } from './assets';
import { Player } from './player';
import { Duck } from './duck';
import { NPCDialogueManager } from './npcDialogueManager';
import { DialogueUI } from './dialogueUI';
import { FaceFilterOverlay } from './faceFilterOverlay';
import { TileAnimator } from './tileAnimator';
import { WorldMap, getWorldMapChar } from './worldMap';
import { Pickup } from './pickup';
import { makeCollageTexture } from './collage';

const TILE_SIZE = 164;

export class Scene {
  private mapSeed = 1337;
  private wallMask = new Map<string, boolean>();
  private collageTex: HTMLCanvasElement = makeCollageTexture(TILE_SIZE);
  private collageTimer = 0;
  private pickups: Pickup[] = [];
  private inventory = new Set<string>();
  private player: Player;
  private ducks: Duck[] = [];
  private frozenPos: { x: number; y: number } | null = null;
  private face?: FaceFilterOverlay;
  private prevDialogueActive = false;

  private playerX = 0;
  private playerY = 0;

  private grassTiles: string[] = ['1.png', '2.png', '3.png', '4.png'];

  private tileCache = new Map<
    string,
    { tile: string | TileAnimator; time: number }
  >();

  private tileLifetime = 3000;

  private lastTileX = 0;
  private lastTileY = 0;

  private dialogueUI: DialogueUI;
  private dialogueManager: NPCDialogueManager;
  private currentNpcName: string | null = null;
  private animatedTiles = new Map<string, TileAnimator>();

  constructor(
    private input: InputHandler,
    private horseSound: HTMLAudioElement,
    private soundtrack: HTMLAudioElement,
    private world: WorldMap
  ) {
    this.player = new Player(this.input, this.horseSound, this.soundtrack);
    const lilDuck = assets['duck.png'];
    if (!lilDuck) {
      throw new Error("Duck asset 'duck.png' not found in assets.");
    }
    this.ducks.push(
      new Duck(
        lilDuck,
        1000,
        1000,
        64,
        64,
        4,
        0.25,
        'animal',
        'assets/duck.mp3'
      )
    );

    const dancer = assets['dancer.png'];
    if (!dancer) {
      throw new Error("Dancer asset 'dancer.png' not found in assets.");
    }
    this.ducks.push(
      new Duck(
        dancer,
        500,
        500,
        64,
        64,
        14,
        0.25,
        'dancer',
        'assets/dancer.mp3'
      )
    );

    this.dialogueUI = new DialogueUI(this.input);
    this.dialogueManager = new NPCDialogueManager('assets/npcQuotes.json');
    this.dialogueManager.load().catch(err => {
      throw new Error(`Failed to load NPC dialogues: ${err}`);
    });

    this.pickups.push(new Pickup('root', 2, 2, 'root.png', 26, 64, 64, 0.08));
  }

  private hashTile(tx: number, ty: number): number {
    const x = tx | 0,
      y = ty | 0;
    let h = (x * 374761393 + y * 668265263 + this.mapSeed * 1442695040) >>> 0;

    h ^= h << 13;
    h >>>= 0;
    h ^= h >> 17;
    h >>>= 0;
    h ^= h << 5;
    h >>>= 0;
    return (h >>> 0) / 0xffffffff;
  }

  private isWallAt(tx: number, ty: number): boolean {
    const k = `${tx},${ty}`;
    const cached = this.wallMask.get(k);
    if (cached !== undefined) return cached;

    const ch = getWorldMapChar(this.world, tx, ty);
    if (ch === 'W' || ch === 'C') {
      this.wallMask.set(k, false);
      return false;
    }

    const r = this.hashTile(tx, ty);
    const isWall = r < 0.12;
    this.wallMask.set(k, isWall);
    return isWall;
  }

  private updatePickups(dt: number): void {
    for (const p of this.pickups) p.update(dt);
  }

  private tryCollectPickup(): void {
    if (!this.input.isDown('f')) return;

    const px = this.playerX;
    const py = this.playerY;
    const range = TILE_SIZE * 10;

    for (const p of this.pickups) {
      const cx = p.tileX * TILE_SIZE + TILE_SIZE / 2;
      const cy = p.tileY * TILE_SIZE + TILE_SIZE / 2;
      const dx = cx - px;
      const dy = cy - py;
      if (Math.sqrt(dx * dx + dy * dy) < range) {
        p.collect();
        this.inventory.add(p.id);

        break;
      }
    }
  }

  private collidesWithPickup(tx: number, ty: number): boolean {
    return this.pickups.some(p => p.isAt(tx, ty));
  }

  private isWalkableTile(tx: number, ty: number): boolean {
    const ch = getWorldMapChar(this.world, tx, ty);
    if (ch === 'W' || ch === 'C') return true;

    return !this.isWallAt(tx, ty);
  }

  private collidesWithNPC(tx: number, ty: number): boolean {
    return this.ducks.some(npc => {
      const nx = Math.floor(npc.worldX / TILE_SIZE);
      const ny = Math.floor(npc.worldY / TILE_SIZE);
      return nx === tx && ny === ty;
    });
  }

  setFaceOverlay(overlay: FaceFilterOverlay): void {
    this.face = overlay;
  }

  private getTile(tileX: number, tileY: number): string | TileAnimator {
    const key = `${tileX},${tileY}`;
    const now = performance.now();

    const cached = this.tileCache.get(key);
    if (cached && now - cached.time < this.tileLifetime) return cached.tile;

    let result: string | TileAnimator;

    const ch = getWorldMapChar(this.world, tileX, tileY);
    if (ch === 'W') {
      if (!this.animatedTiles.has(key)) {
        this.animatedTiles.set(
          key,
          new TileAnimator('water.jpg', 64, 64, 10, 0.15)
        );
      }
      result = this.animatedTiles.get(key)!;
    } else if (ch === 'G' || ch === null) {
      if (this.isWallAt(tileX, tileY)) {
        result = '4.png';
      } else {
        const grassOptions = ['1.png', '2.png', '3.png'];
        const base =
          grassOptions[Math.floor(Math.random() * grassOptions.length)] ??
          '1.png';
        result = base;
      }
    } else {
      result =
        ['1.png', '2.png', '3.png'][Math.floor(Math.random() * 3)] ?? '1.png';
    }

    this.tileCache.set(key, { tile: result, time: now });
    return result;
  }

  SPEED = 200;

  update(dt: number): void {
    this.collageTimer += dt;
    if (this.collageTimer > 2) {
      this.collageTex = makeCollageTexture(TILE_SIZE);
      this.collageTimer = 0;
    }
    for (const anim of this.animatedTiles.values()) {
      anim.update(dt);
    }
    this.updatePickups(dt);
    const inDialogue = this.dialogueUI.isActive();

    if (inDialogue && this.frozenPos) {
      this.playerX = this.frozenPos.x;
      this.playerY = this.frozenPos.y;
    }

    this.player.setInputEnabled(!inDialogue);

    if (!inDialogue) {
      const step = this.SPEED * dt;

      let dx = 0,
        dy = 0;
      if (this.input.isDown('a')) dx -= step;
      if (this.input.isDown('d')) dx += step;
      if (this.input.isDown('w')) dy -= step;
      if (this.input.isDown('s')) dy += step;

      if (dx !== 0) {
        const nextX = this.playerX + dx;
        const { cx, cy } = this.getPlayerCenterTile(nextX, this.playerY);
        if (
          this.isWalkableTile(cx, cy) &&
          !this.collidesWithNPC(cx, cy) &&
          !this.collidesWithPickup(cx, cy)
        ) {
          this.playerX = nextX;
        }
      }

      if (dy !== 0) {
        const nextY = this.playerY + dy;
        const { cx, cy } = this.getPlayerCenterTile(this.playerX, nextY);
        if (
          this.isWalkableTile(cx, cy) &&
          !this.collidesWithNPC(cx, cy) &&
          !this.collidesWithPickup(cx, cy)
        ) {
          this.playerY = nextY;
        }
      }

      this.checkNPCInteraction();
    } else {
      this.dialogueUI.update(dt);
      const submitted = this.dialogueUI.pollSubmittedText();
      if (submitted) {
        const response = this.dialogueManager.getNPCResponse(submitted);
        const label = this.currentNpcName ?? 'NPC';
        this.dialogueUI.open(label, response);
      }
    }

    this.tryCollectPickup();

    const currentTileX = Math.floor(this.playerX / TILE_SIZE);
    const currentTileY = Math.floor(this.playerY / TILE_SIZE);

    if (currentTileX !== this.lastTileX || currentTileY !== this.lastTileY) {
      this.onTileChanged(currentTileX, currentTileY);
      this.lastTileX = currentTileX;
      this.lastTileY = currentTileY;
    }
    this.player.update(dt);

    this.ducks.forEach(sprite => sprite.update(dt));

    for (const npc of this.ducks) {
      if (!npc.audio) continue;

      const dx = npc.worldX - this.playerX;
      const dy = npc.worldY - this.playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const maxDist = 300;
      let targetVolume = 0;

      if (dist < maxDist) {
        targetVolume = 1 - dist / maxDist;
      }

      if (targetVolume > 0 && npc.audio.paused) {
        npc.audio.play().catch(err => console.warn('Audio blocked:', err));
      } else if (targetVolume <= 0 && !npc.audio.paused) {
        npc.audio.pause();
      }

      npc.audio.volume += (targetVolume - npc.audio.volume) * 0.1;
    }
    const isActive = this.dialogueUI.isActive();
    if (!this.prevDialogueActive && isActive) {
      this.face?.show();
    } else if (this.prevDialogueActive && !isActive) {
      this.face?.hide();
      this.dialogueUI.disableTyping();
      this.frozenPos = null;
      this.input.clear?.();
    }
    this.prevDialogueActive = isActive;
  }

  private checkNPCInteraction(): void {
    if (!this.input.isDown('e')) return;

    const radius = 100;
    let best: Duck | null = null;
    let bestDistSq = Infinity;

    for (const npc of this.ducks) {
      const dx = npc.worldX - this.playerX;
      const dy = npc.worldY - this.playerY;
      const d2 = dx * dx + dy * dy;
      if (d2 < radius * radius && d2 < bestDistSq) {
        best = npc;
        bestDistSq = d2;
      }
    }

    if (best) {
      this.startTalk(best.name);
    }
  }

  private onTileChanged(tileX: number, tileY: number): void {
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        const key = `${tileX + x},${tileY + y}`;
        this.tileCache.delete(key);
      }
    }
  }

  render(renderer: Renderer): void {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const cameraX = this.playerX - screenWidth / 2;
    const cameraY = this.playerY - screenHeight / 2;

    const startTileX = Math.floor(cameraX / TILE_SIZE) - 1;
    const startTileY = Math.floor(cameraY / TILE_SIZE) - 1;
    const endTileX = Math.ceil((cameraX + screenWidth) / TILE_SIZE) + 1;
    const endTileY = Math.ceil((cameraY + screenHeight) / TILE_SIZE) + 1;

    for (let tileY = startTileY; tileY < endTileY; tileY++) {
      for (let tileX = startTileX; tileX < endTileX; tileX++) {
        const screenX = tileX * TILE_SIZE - cameraX;
        const screenY = tileY * TILE_SIZE - cameraY;

        if (getWorldMapChar(this.world, tileX, tileY) === 'C') {
          renderer.ctx.drawImage(
            this.collageTex,
            screenX,
            screenY,
            TILE_SIZE,
            TILE_SIZE
          );
          continue;
        }

        const t = this.getTile(tileX, tileY);
        if (!t) continue;
        if (typeof t === 'string') {
          const img = assets[t];
          if (img) renderer.drawImage(img, screenX, screenY, TILE_SIZE);
        } else {
          t.render(renderer.ctx, screenX, screenY, TILE_SIZE);
        }
      }
    }
    for (const p of this.pickups) {
      p.render(renderer.ctx, cameraX, cameraY, TILE_SIZE);
    }
    const px = screenWidth / 2 - 32;
    const py = screenHeight / 2 - 32;

    this.player.render(renderer.ctx, px, py);
    this.ducks.forEach(duck => {
      duck.render(renderer.ctx, cameraX, cameraY, TILE_SIZE);
    });
    this.dialogueUI.render(renderer.ctx, screenWidth, screenHeight);
  }
  private getPlayerCenterTile(
    px = this.playerX,
    py = this.playerY
  ): { cx: number; cy: number } {
    const cx = Math.floor((px + TILE_SIZE / 2) / TILE_SIZE);
    const cy = Math.floor((py + TILE_SIZE / 2) / TILE_SIZE);
    return { cx, cy };
  }

  private startTalk(npcName: string): void {
    this.currentNpcName = npcName;
    this.frozenPos = { x: this.playerX, y: this.playerY };
    this.dialogueManager.startConversation(npcName);
    this.dialogueUI.open('You', '');
    this.dialogueUI.enableTyping();
    this.input.clear?.();
  }
}
