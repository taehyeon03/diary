/** 서버/DB에 저장되는 포스트잇. 날짜 정보는 여기에만 있다. */
export type PostitRecord = {
  id: string;
  kind: "text";
  text: string;
  author: string | null;
  color: string;
  rotation: number;
  /** 벽의 남는 너비(벽 너비 - 포스트잇 너비) 대비 비율 (0~1) */
  x: number;
  /** 벽 위에서부터의 거리 (px) */
  y: number;
  weatherCode: number | null;
  humidity: number | null;
  createdAt: string;
  fallAt: string;
  removed: boolean;
};

/** 일반 사용자에게 보내는 포스트잇. 날짜·시간은 절대 포함하지 않는다. */
export type PublicPostit = {
  id: string;
  kind: "text";
  text: string;
  author: string | null;
  color: string;
  rotation: number;
  x: number;
  y: number;
  /** 들뜬 정도: 0 = 잘 붙어 있음, 1 = 살짝 들뜸, 2 = 매달려 있음 */
  stage: 0 | 1 | 2;
};
