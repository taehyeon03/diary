# 언젠간 떨어질 포스트잇

나무색 종이 벽에 붙은 포스트잇처럼, 내 말을 주변 사람들에게 남기는 곳.
모든 포스트잇은 언젠간 떨어진다. 다만 언제 떨어질지는 아무도 모른다.

기획서: [PLAN.md](./PLAN.md)

## 지금 되는 것 (1단계)

- 나무색 크라프트 종이 벽 하나, 모두가 같은 벽을 본다
- 텍스트 포스트잇 붙이기 (캘리그라피 글씨체: 나눔손글씨 붓)
- 색·기울기·위치는 붙이는 순간 서버가 정한다
- 접착력: 최소 24시간 ~ 최대 7일, 광주광역시 날씨(Open-Meteo)에 따라 달라짐
- 시간이 지나면 모서리가 들뜨고 → 매달리고 → 떨어진다 (날짜·남은 시간은 표시하지 않음)
- 포스트잇 한 번 누르기: 크게 보기
- 포스트잇 빠르게 5번 누르기: 이스터에그 — 30% 확률로 (내 화면에서만) 떨어지고, 그 자리 벽에 적힌 문구가 보인다

## 로컬에서 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

Supabase 설정이 없으면 `data/postits.json` 파일에 저장된다 (로컬 개발용).

## Supabase 연결

1. [supabase.com](https://supabase.com) 가입 → **New project** (Region: Northeast Asia (Seoul) 추천)
2. 왼쪽 메뉴 **SQL Editor** → New query → `supabase/schema.sql` 내용을 전부 붙여넣고 **Run**
   - 포스트잇, 바닥 뽑기 기록, 이스터에그 문구 테이블이 만들어진다 (여러 번 실행해도 안전)
3. **Project Settings → API Keys** 에서 두 값을 복사
   - Project URL → `SUPABASE_URL`
   - Secret key (`sb_secret_...`, 예전 프로젝트는 `service_role`) → `SUPABASE_SECRET_KEY`
4. 프로젝트 폴더에 `.env.local` 파일을 만들어 넣는다 (`.env.example` 참고)
5. 연결 확인

```bash
npm run check:supabase
# ✓ postits (0개)
# ✓ floor_picks (0개)
# ✓ easter_messages (4개)
```

> secret key는 서버에서만 쓴다. 브라우저 코드나 GitHub에 절대 올리지 말 것 (`.env.local`은 git에서 제외되어 있음).
> 이스터에그 문구는 Supabase 대시보드 **Table Editor → easter_messages** 에서 바로 추가/수정/끄기(`active`) 할 수 있다.

## 배포 (Vercel)

1. [vercel.com](https://vercel.com) 에서 이 GitHub 저장소를 Import
2. **Environment Variables** 에 `SUPABASE_URL`, `SUPABASE_SECRET_KEY` 추가
3. Deploy. 이후 GitHub에 푸시할 때마다 자동으로 다시 배포된다
