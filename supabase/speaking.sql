-- ============================================================
-- Speaking practice: attempt history + 2-per-day limit
-- Already applied to the live project via migration "speaking_attempts".
-- ============================================================

create table if not exists public.speaking_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  card_id text not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  total_score numeric,          -- sum of the 4 criteria bands
  result jsonb,                 -- full feedback shown to the student (no audio is stored)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists speaking_attempts_user_day_idx
  on public.speaking_attempts (user_id, created_at desc);

alter table public.speaking_attempts enable row level security;

-- students can read their own history; all writes go through the server (service role)
create policy "speaking_attempts: read own"
  on public.speaking_attempts for select
  using (auth.uid() = user_id);

-- Atomically claim one of today's attempts (day = Malaysia time).
-- Returns the new attempt id, or null when the daily limit is used up.
-- Failed attempts do not count against the limit.
create or replace function public.claim_speaking_attempt(p_card text, p_limit int default 2)
returns uuid as $$
declare
  uid uuid := auth.uid();
  used int;
  new_id uuid;
begin
  if uid is null then
    return null;
  end if;

  -- serialise concurrent requests from the same user
  perform pg_advisory_xact_lock(hashtext(uid::text));

  select count(*) into used
  from public.speaking_attempts
  where user_id = uid
    and status <> 'failed'
    and (created_at at time zone 'Asia/Kuala_Lumpur')::date
        = (now() at time zone 'Asia/Kuala_Lumpur')::date;

  if used >= p_limit then
    return null;
  end if;

  insert into public.speaking_attempts (user_id, card_id)
  values (uid, p_card)
  returning id into new_id;

  return new_id;
end;
$$ language plpgsql security definer set search_path = public;

-- how many attempts are left today (for the UI)
create or replace function public.speaking_attempts_left(p_limit int default 2)
returns int as $$
  select greatest(p_limit - count(*)::int, 0)
  from public.speaking_attempts
  where user_id = auth.uid()
    and status <> 'failed'
    and (created_at at time zone 'Asia/Kuala_Lumpur')::date
        = (now() at time zone 'Asia/Kuala_Lumpur')::date;
$$ language sql security definer stable set search_path = public;

revoke all on function public.claim_speaking_attempt(text, int) from public, anon;
grant execute on function public.claim_speaking_attempt(text, int) to authenticated;
revoke all on function public.speaking_attempts_left(int) from public, anon;
grant execute on function public.speaking_attempts_left(int) to authenticated;
