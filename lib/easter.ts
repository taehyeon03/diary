export const FALL_MESSAGE = "당신은 포스트잇을 떨구게 했어!!";

// 떨어진 포스트잇 자리 뒤, 벽에 적혀 있던 문구 (무작위로 하나)
// Supabase의 easter_messages 테이블이 있으면 그쪽 문구를 쓴다.
export const DEFAULT_WALL_MESSAGES = [
  "당신의 호기심을 잃지 마세요!",
  "저는 당신이 힘들지 않았으면 해요",
  "아자스!",
  "당신은 사랑이란 말이 어울리는 사람.\n누가 그랬는데 그렇다고요 ㅎㅎ",
];

export const EASTER_TAPS = 5;
export const EASTER_WINDOW_MS = 1500;
/** 빠르게 여러 번 눌렀을 때 실제로 떨어질 확률. 실패하면 흔들리기만 한다. */
export const EASTER_CHANCE = 0.3;
