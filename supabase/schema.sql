-- 언젠간 떨어질 포스트잇
-- Supabase 대시보드 → SQL Editor → New query 에 전부 붙여넣고 Run.
-- 여러 번 실행해도 안전합니다.

-- ── 포스트잇 ──────────────────────────────────────────────
create table if not exists public.postits (
  id           uuid primary key,
  kind         text not null default 'text' check (kind in ('text', 'drawing', 'photo')),
  text         text not null default '',
  image_url    text,
  author       text,
  color        text not null,
  rotation     real not null,
  pos_x        real not null,
  pos_y        real not null,
  weather_code int,
  humidity     int,
  created_at   timestamptz not null default now(),
  fall_at      timestamptz not null,
  removed      boolean not null default false
);

create index if not exists postits_fall_at_idx on public.postits (fall_at);

-- ── 바닥에서 하루 한 번 뽑기 기록 (4단계에서 사용) ─────────────
create table if not exists public.floor_picks (
  visitor_id text not null,
  pick_date  date not null,
  postit_id  uuid not null references public.postits (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (visitor_id, pick_date)
);

-- ── 이스터에그: 떨어진 포스트잇 뒤 벽에 적힌 문구 ───────────────
create table if not exists public.easter_messages (
  id      bigint generated always as identity primary key,
  message text not null unique,
  active  boolean not null default true
);

insert into public.easter_messages (message) values
  ('당신의 호기심을 잃지 마세요!'),
  ('저는 당신이 힘들지 않았으면 해요'),
  ('아자스!'),
  (E'당신은 사랑이란 말이 어울리는 사람.\n누가 그랬는데 그렇다고요 ㅎㅎ')
on conflict (message) do nothing;

-- ── 보안: 브라우저에서 직접 접근 금지, 서버(secret key)만 읽고 쓴다 ──
alter table public.postits         enable row level security;
alter table public.floor_picks     enable row level security;
alter table public.easter_messages enable row level security;
