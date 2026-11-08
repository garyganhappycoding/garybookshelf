-- ============================================================
-- Essay marking ("Writing"): attempt history + 1 free essay a day, then speaking pack credits.
-- Mirrors the speaking tables. A paid essay uses one credit from the SAME speaking_packs the student already bought
-- (credits are shared between speaking and writing; change here if Gary decides otherwise).
-- Applied to the live project on 8 Nov 2026 (migration "writing_attempts") after Gary said yes.
-- ============================================================

create table if not exists public.writing_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  part smallint not null default 3 check (part in (1, 2, 3)),
  genre text not null check (genre in ('email', 'essay', 'story', 'report', 'article')),
  question text not null,
  essay text not null,
  word_count int,
  status text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  total_score numeric,          -- sum of the 4 criteria, out of 20
  result jsonb,                 -- the report shown to the student; free reports never contain the paid parts
  tier text check (tier in ('free', 'paid')),
  pack_id uuid references public.speaking_packs on delete set null,
  priority boolean default false,
  model text,
  fail_reason text,
  fail_detail text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists writing_attempts_user_idx on public.writing_attempts (user_id, created_at desc);

alter table public.writing_attempts enable row level security;

-- students can read their own essays and reports; every write goes through the server (service role)
create policy "writing_attempts: read own"
  on public.writing_attempts for select
  using ((select auth.uid()) = user_id);

-- Atomically claim one essay. Order: today's free essay (Malaysia day) first, then one credit from a speaking pack.
-- Returns the new attempt id, or null when there is nothing left.
create or replace function public.claim_writing_attempt(
  p_part int, p_genre text, p_question text, p_essay text, p_words int, p_limit int default 1
) returns uuid as $$
declare
  uid uuid := auth.uid();
  used int;
  new_id uuid;
  pk uuid;
begin
  if uid is null then
    return null;
  end if;

  perform pg_advisory_xact_lock(hashtext('w' || uid::text));

  -- refund essays that never finished
  update public.writing_attempts
     set status = 'failed', fail_reason = 'server_error',
         fail_detail = 'Marking did not finish (timed out). Refunded automatically.'
   where user_id = uid and status = 'pending' and created_at < now() - interval '3 minutes';

  select count(*) into used
  from public.writing_attempts
  where user_id = uid
    and status <> 'failed'
    and pack_id is null
    and (created_at at time zone 'Asia/Kuala_Lumpur')::date = (now() at time zone 'Asia/Kuala_Lumpur')::date;

  if used < p_limit then
    insert into public.writing_attempts (user_id, part, genre, question, essay, word_count)
    values (uid, p_part, p_genre, p_question, p_essay, p_words)
    returning id into new_id;
    return new_id;
  end if;

  select id into pk
  from public.speaking_packs
  where user_id = uid and expires_at > now() and attempts_used < attempts_total
  order by expires_at
  limit 1
  for update;

  if pk is null then
    return null;
  end if;

  update public.speaking_packs set attempts_used = attempts_used + 1 where id = pk;
  insert into public.writing_attempts (user_id, part, genre, question, essay, word_count, pack_id)
  values (uid, p_part, p_genre, p_question, p_essay, p_words, pk)
  returning id into new_id;
  return new_id;
end;
$$ language plpgsql security definer set search_path = public;

-- free essays left today (for the page)
create or replace function public.writing_attempts_left(p_limit int default 1)
returns int as $$
  select greatest(p_limit - count(*)::int, 0)
  from public.writing_attempts
  where user_id = auth.uid()
    and status <> 'failed'
    and not (status = 'pending' and created_at < now() - interval '5 minutes')
    and pack_id is null
    and (created_at at time zone 'Asia/Kuala_Lumpur')::date = (now() at time zone 'Asia/Kuala_Lumpur')::date;
$$ language sql security definer stable set search_path = public;

-- a failed essay gives its pack credit back (same idea as speaking_attempts_refund)
create or replace function public.refund_writing_pack_attempt()
returns trigger as $$
begin
  if new.status = 'failed' and old.status <> 'failed' and new.pack_id is not null then
    update public.speaking_packs set attempts_used = greatest(attempts_used - 1, 0) where id = new.pack_id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists writing_attempts_refund on public.writing_attempts;
create trigger writing_attempts_refund
  after update of status on public.writing_attempts
  for each row execute function public.refund_writing_pack_attempt();

revoke all on function public.claim_writing_attempt(int, text, text, text, int, int) from public, anon;
grant execute on function public.claim_writing_attempt(int, text, text, text, int, int) to authenticated;
revoke all on function public.writing_attempts_left(int) from public, anon;
grant execute on function public.writing_attempts_left(int) to authenticated;

-- ============================================================
-- Beta testers (added 8 Nov 2026). Gary's friends can use /writing while WRITING_OPEN is off.
-- Add one with:  insert into public.writing_beta_testers (email, note) values ('friend@gmail.com', 'name');
-- Remove with:   delete from public.writing_beta_testers where email = 'friend@gmail.com';
-- Applied to the live project (migration "writing_beta_testers").
-- ============================================================
create table if not exists public.writing_beta_testers (
  email text primary key,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.writing_beta_testers enable row level security; -- no policies: only the server (service role) can read or change it
