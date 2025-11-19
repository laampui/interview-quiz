export enum SnowflakeMode {
  COMPANY = 'COMPANY',
  TOC = 'TOC',
}

export type DimensionKey = 'value' | 'future' | 'past' | 'health' | 'dividend';

export interface DimensionData {
  key: DimensionKey;
  label: string;
  score: number; // 0-7
  description: string;
  section: boolean[]; // 6 checks
}

export type SnowflakeDataMap = Record<DimensionKey, DimensionData>;

export interface Point {
  x: number;
  y: number;
}

export const ORDERED_KEYS: DimensionKey[] = [
  'value',
  'future',
  'past',
  'health',
  'dividend',
];

export const MAX_SCORE = 7; // 6 levels, usually 0-6 or 1-7, prompt says 0-7 (8 levels)
// Actually prompt says 0-7 (8 scores). Let's map radius 0 to center, radius 7 to edge.

export const COLOR_RED = '#FF2B2B';
export const COLOR_GREEN = '#00E613';
