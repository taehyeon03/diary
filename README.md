# 언젠간 떨어질 포스트잇

나무 벽에 붙은 포스트잇처럼, 내 말을 주변 사람들에게 남기는 곳.
모든 포스트잇은 언젠간 떨어진다. 다만 언제 떨어질지는 아무도 모른다.

기획서: [PLAN.md](./PLAN.md)

## 지금 되는 것 (1단계)

- 나무 벽 하나, 모두가 같은 벽을 본다
- 텍스트 포스트잇 붙이기 (캘리그라피 글씨체: 나눔손글씨 붓)
- 색·기울기·위치는 붙이는 순간 서버가 정한다
- 접착력: 최소 24시간 ~ 최대 7일, 광주광역시 날씨(Open-Meteo)에 따라 달라짐
- 시간이 지나면 모서리가 들뜨고 → 매달리고 → 떨어진다 (날짜·남은 시간은 표시하지 않음)
- 포스트잇 한 번 누르기: 크게 보기
- 포스트잇 빠르게 5번 누르기: 이스터에그 (내 화면에서만 떨어지고 뒷면 문구가 보임)

## 로컬에서 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

Supabase 설정이 없으면 `data/postits.json` 파일에 저장된다 (로컬 개발용).

## 배포 (Supabase + Vercel)

1. [Supabase](https://supabase.com)에서 새 프로젝트를 만든다
2. SQL Editor에서 `supabase/schema.sql`을 실행한다
3. [Vercel](https://vercel.com)에서 이 GitHub 저장소를 가져온다
4. Vercel 환경 변수에 추가한다
   - `SUPABASE_URL` — Supabase 프로젝트 URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase의 service_role 키 (절대 공개하지 말 것)
5. 배포하면 끝. 이후 GitHub에 푸시할 때마다 자동으로 다시 배포된다
