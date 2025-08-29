import { loadAssets } from './assets';
import { Game } from './game';
import { FaceFilterOverlay } from './faceFilterOverlay';
import { loadWorldMap } from './worldMap';
import { loadRandomImages } from './collage';
import './style.css';

const loadCollageImages = async (): Promise<void> => {
  const response = await fetch('assets/collage.json');
  if (!response.ok) {
    throw new Error(`Failed to load collage.json: ${response.statusText}`);
  }
  const data = await response.json();
  await loadRandomImages(data.images);
};
const face = new FaceFilterOverlay();

const horseSound = new Audio('assets/horsEren.mp3');
horseSound.loop = true;

const soundtrack = new Audio('assets/Sima.mp3');
soundtrack.loop = true;

const ASSET_LIST = [
  '1.png',
  '2.png',
  '3.png',
  '4.png',
  'walk_right.png',
  'walk_left.png',
  'walk_up.png',
  'walk_down.png',
  'idle_right.png',
  'idle_left.png',
  'duck.png',
  'dancer.png',
  'clown.png',
  'water.jpg',
  'root.png',
];

window.addEventListener('load', async () => {
  await loadAssets(ASSET_LIST);
  await loadCollageImages();
  const world = await loadWorldMap('assets/world.json');
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const game = new Game(canvas, horseSound, soundtrack, world);
  game.setFaceOverlay(face);
  const unlock = (): void => {
    face.init().catch(console.warn);
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('click', unlock);
  window.addEventListener('keydown', unlock);

  game.start();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).face = face;
});
