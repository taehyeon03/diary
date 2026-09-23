// 나무 벽 위에서 튀지 않는 톤다운 포스트잇 색
export const PAPER_COLORS = [
  "#F3E3A6", // 바랜 버터
  "#F4EBD6", // 크림
  "#F2C9A8", // 살구
  "#E8BFB8", // 먼지 장미
  "#CDD8B8", // 세이지
  "#C9D8DC", // 흐린 하늘
];

export const NOTE_SIZE = 180; // px, 벽 위 포스트잇 한 변
const X_MIN = 0;
const X_MAX = 1;

export function pickColor(): string {
  return PAPER_COLORS[Math.floor(Math.random() * PAPER_COLORS.length)];
}

export function pickRotation(): number {
  return Math.round((Math.random() * 12 - 6) * 10) / 10;
}

/**
 * 이미 붙은 포스트잇들과 최대한 덜 겹치는 자리를 고른다.
 * 벽은 포스트잇이 많아질수록 아래로 길어진다.
 */
export function pickPosition(existing: { x: number; y: number }[]): { x: number; y: number } {
  const height = Math.max(520, Math.ceil((existing.length + 1) / 2) * 190);
  let best = { x: 0.4, y: 40 };
  let bestScore = -1;
  for (let i = 0; i < 24; i++) {
    const c = { x: X_MIN + Math.random() * (X_MAX - X_MIN), y: 30 + Math.random() * (height - 30) };
    // x는 남는 너비 대비 비율 → 폰 화면(남는 너비 약 200px) 기준으로 거리 환산
    const nearest = existing.reduce(
      (min, e) => Math.min(min, Math.hypot((e.x - c.x) * 200, e.y - c.y)),
      Infinity,
    );
    if (nearest > bestScore) {
      bestScore = nearest;
      best = c;
    }
  }
  return { x: Math.round(best.x * 1000) / 1000, y: Math.round(best.y) };
}
