export type TileType = 'grass' | 'wall' | null;

export interface WorldMap {
  legend: Record<string, string>;
  rows: string[];
  width: number;
  height: number;
}

export const loadWorldMap = async (path: string): Promise<WorldMap> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(
      `Failed to load world map from ${path}: ${response.statusText}`
    );
  }
  const json = await response.json();

  const rows: string[] = json.rows ?? [];

  if (!rows.length) {
    throw new Error(`World map at ${path} has no rows`);
  }
  const width = rows[0]?.length ?? 0;
  if (width === 0) {
    throw new Error(`World map at ${path} has empty first row`);
  }
  if (!rows.every(row => row.length === width)) {
    throw new Error(`World map at ${path} has rows of varying lengths`);
  }

  return {
    legend: json.legend ?? {},
    rows,
    width,
    height: rows.length,
  };
};

export const getWorldMapChar = (
  world: WorldMap,
  tx: number,
  ty: number
): string | null => {
  if (ty < 0 || ty >= world.height || tx < 0 || tx >= world.width) return null;
  const row = world.rows[ty];
  if (typeof row === 'undefined' || typeof row[tx] === 'undefined') {
    return null;
  }
  return row[tx];
};
