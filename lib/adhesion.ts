const HOUR = 60 * 60 * 1000;
export const MIN_LIFE = 24 * HOUR;
export const MAX_LIFE = 7 * 24 * HOUR;

/**
 * 24시간 이후 추가로 버티는 시간 (날씨 반영 전).
 * 전체 수명 기준: 1~2일 40%, 2~3일 30%, 3~5일 20%, 5~7일 10%
 */
function baseExtra(): number {
  const r = Math.random();
  const between = (a: number, b: number) => (a + Math.random() * (b - a)) * HOUR;
  if (r < 0.4) return between(0, 24);
  if (r < 0.7) return between(24, 48);
  if (r < 0.9) return between(48, 96);
  return between(96, 144);
}

export function sampleFallAt(createdAt: Date, factor: number): Date {
  const life = Math.min(MAX_LIFE, MIN_LIFE + baseExtra() * factor);
  return new Date(createdAt.getTime() + life);
}

export function stageOf(createdAt: string, fallAt: string, now = Date.now()): 0 | 1 | 2 {
  const start = new Date(createdAt).getTime();
  const end = new Date(fallAt).getTime();
  const p = (now - start) / (end - start);
  if (p < 0.6) return 0;
  if (p < 0.85) return 1;
  return 2;
}
