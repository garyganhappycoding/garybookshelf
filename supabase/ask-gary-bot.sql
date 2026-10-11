-- Ask Gary bot core tables. Already applied to the live project via migration "ask_gary_bot_core".
-- gary_knowledge is filled from the Notion "gary ai database" (only rows with review = 'Approved' are used for students).

create table if not exists public.gary_knowledge (
  id uuid default gen_random_uuid() primary key,
  notion_page_id text unique not null,
  topic text not null,
  subjects text[] not null default '{}',
  format text,
  review text not null default 'Needs review',
  questions_en text,
  questions_zh text,
  answer_zh text,
  answer_en text,
  reel_link text,
  free_keyword text,
  product text,
  synced_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.gary_knowledge enable row level security; -- no policies: server (service role) only

create table if not exists public.ask_gary_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  conversation_id uuid references public.ask_gary_conversations on delete set null,
  status text not null default 'pending' check (status in ('pending', 'done', 'failed')),
  found boolean,
  entry_ids uuid[] not null default '{}',
  language text,
  level text,
  draft_mode boolean not null default false,
  question text,
  context jsonb,
  vote smallint,
  fail_reason text,
  safety boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists ask_gary_events_user_day_idx on public.ask_gary_events (user_id, created_at desc);
alter table public.ask_gary_events enable row level security;
create policy "ask_gary_events: read own" on public.ask_gary_events for select using (auth.uid() = user_id);

create table if not exists public.ask_gary_unanswered (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.ask_gary_events on delete cascade,
  question text not null,
  context jsonb,
  status text not null default 'open' check (status in ('open', 'answered', 'ignored')),
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.ask_gary_unanswered enable row level security;

-- claim one question of today's limit (Malaysia time); failed questions do not count
create or replace function public.claim_ask_gary_question(p_limit int default 5, p_conversation uuid default null)
returns uuid as $$
declare
  uid uuid := auth.uid();
  used int;
  new_id uuid;
begin
  if uid is null then return null; end if;
  perform pg_advisory_xact_lock(hashtext('askgary' || uid::text));
  select count(*) into used from public.ask_gary_events
  where user_id = uid and status <> 'failed'
    and (created_at at time zone 'Asia/Kuala_Lumpur')::date = (now() at time zone 'Asia/Kuala_Lumpur')::date;
  if used >= p_limit then return null; end if;
  insert into public.ask_gary_events (user_id, conversation_id) values (uid, p_conversation) returning id into new_id;
  return new_id;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.ask_gary_questions_left(p_limit int default 5)
returns int as $$
  select greatest(p_limit - count(*)::int, 0) from public.ask_gary_events
  where user_id = auth.uid() and status <> 'failed'
    and (created_at at time zone 'Asia/Kuala_Lumpur')::date = (now() at time zone 'Asia/Kuala_Lumpur')::date;
$$ language sql security definer stable set search_path = public;

revoke all on function public.claim_ask_gary_question(int, uuid) from public, anon;
grant execute on function public.claim_ask_gary_question(int, uuid) to authenticated;
revoke all on function public.ask_gary_questions_left(int) from public, anon;
grant execute on function public.ask_gary_questions_left(int) to authenticated;
