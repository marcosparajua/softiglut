export const collageSources: HTMLImageElement[] = [];

export const loadRandomImages = (urls: string[]): Promise<void> => {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const image = new Image();

        image.crossOrigin = 'anonymous';
        image.onload = (): void => {
          collageSources.push(image);
          resolve();
        };
        image.onerror = (): void =>
          reject(new Error(`Failed to load image: ${url}`));
        image.src = url;
      });
    })
  ).then(() => undefined);
};

export const makeCollageTexture = (size = 164): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < 6; i++) {
    const img =
      collageSources[Math.floor(Math.random() * collageSources.length)];
    if (!img) continue;

    const sw = size / 2;
    const sh = size / 2;
    const sx = Math.floor(Math.random() * (img.width - sw));
    const sy = Math.floor(Math.random() * (img.height - sh));

    const dx = (i % 2) * (size / 2);
    const dy = Math.floor(i / 2) * (size / 2);

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh);
  }

  return canvas;
};
