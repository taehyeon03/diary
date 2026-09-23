-- 언젠간 떨어질 포스트잇: Supabase SQL Editor에서 한 번 실행
create table if not exists postits (
  id           uuid primary key,
  kind         text not null default 'text',
  text         text not null,
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

create index if not exists postits_fall_at_idx on postits (fall_at);

-- 서버(service role)만 읽고 쓴다. 브라우저에서 직접 접근 금지.
alter table postits enable row level security;
