-- 언젠간 떨어질 포스트잇: 서버가 호출하는 DB 함수
-- 테이블에는 직접 접근할 수 없고(RLS), 이 함수들만 값을 검사한 뒤 읽고 쓴다.
-- 그래서 공개용(publishable) 키로도 안전하게 동작한다.
-- schema.sql 다음에 실행. 여러 번 실행해도 안전합니다.

-- 벽에 붙어 있는 포스트잇
create or replace function public.wall_postits()
returns setof public.postits
language sql stable security definer set search_path = public
as $$
  select * from postits
  where not removed and fall_at > now()
  order by created_at;
$$;

-- 포스트잇 붙이기: 서버가 정한 값을 받아 범위를 검사하고 저장
create or replace function public.insert_postit(
  p_id uuid,
  p_text text,
  p_author text,
  p_color text,
  p_rotation real,
  p_x real,
  p_y real,
  p_weather_code int,
  p_humidity int,
  p_fall_at timestamptz
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if coalesce(length(trim(p_text)), 0) = 0 or length(p_text) > 200 then
    raise exception 'invalid text';
  end if;
  if p_author is not null and length(p_author) > 20 then
    raise exception 'invalid author';
  end if;
  if p_color not in ('#F3E3A6', '#F4EBD6', '#F2C9A8', '#E8BFB8', '#CDD8B8', '#C9D8DC') then
    raise exception 'invalid color';
  end if;
  if p_fall_at < now() + interval '23 hours 59 minutes' or p_fall_at > now() + interval '7 days 1 minute' then
    raise exception 'invalid fall_at';
  end if;

  insert into postits (id, kind, text, author, color, rotation, pos_x, pos_y,
                       weather_code, humidity, created_at, fall_at, removed)
  values (p_id, 'text', p_text, nullif(trim(p_author), ''), p_color,
          least(6, greatest(-6, p_rotation)),
          least(1, greatest(0, p_x)),
          least(100000, greatest(0, p_y)),
          p_weather_code, p_humidity, now(), p_fall_at, false);
end;
$$;

-- 이스터에그: 벽에 적힌 문구
create or replace function public.wall_messages()
returns setof text
language sql stable security definer set search_path = public
as $$
  select message from easter_messages where active order by id;
$$;

revoke all on function public.wall_postits() from public;
revoke all on function public.insert_postit(uuid, text, text, text, real, real, real, int, int, timestamptz) from public;
revoke all on function public.wall_messages() from public;
grant execute on function public.wall_postits() to anon, authenticated, service_role;
grant execute on function public.insert_postit(uuid, text, text, text, real, real, real, int, int, timestamptz) to anon, authenticated, service_role;
grant execute on function public.wall_messages() to anon, authenticated, service_role;
