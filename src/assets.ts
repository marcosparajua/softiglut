export const assets: { [key: string]: HTMLImageElement } = {};
export const loadAssets = (names: string[]): Promise<void> => {
  const promises = names.map(name => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = `assets/${name}`;
      img.onload = (): void => {
        assets[name] = img;
        resolve();
      };
      img.onerror = (): void => {
        reject(new Error(`Failed to load asset: ${name}`));
      };
    });
  });

  return Promise.all(promises).then(() => undefined);
};
