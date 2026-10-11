-- Ask Gary chat history. Already applied to the live project via migration "ask_gary_chat_history".

create table if not exists public.ask_gary_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'New chat',
  context jsonb,  -- what the student told Gary: problem, story, level, effort, what they want
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ask_gary_messages (
  id uuid default gen_random_uuid() primary key,
  seq bigint generated always as identity,
  conversation_id uuid references public.ask_gary_conversations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'gary')),
  content text not null,
  meta jsonb,  -- e.g. {"reel": true} or {"notFound": true}, later: matched entries
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists ask_gary_conversations_user_idx on public.ask_gary_conversations (user_id, updated_at desc);
create index if not exists ask_gary_messages_conv_idx on public.ask_gary_messages (conversation_id, seq);

alter table public.ask_gary_conversations enable row level security;
alter table public.ask_gary_messages enable row level security;

create policy "ask_gary_conversations: read own" on public.ask_gary_conversations for select using (auth.uid() = user_id);
create policy "ask_gary_conversations: insert own" on public.ask_gary_conversations for insert with check (auth.uid() = user_id);
create policy "ask_gary_conversations: update own" on public.ask_gary_conversations for update using (auth.uid() = user_id);
create policy "ask_gary_conversations: delete own" on public.ask_gary_conversations for delete using (auth.uid() = user_id);

create policy "ask_gary_messages: read own" on public.ask_gary_messages for select using (auth.uid() = user_id);
create policy "ask_gary_messages: insert own" on public.ask_gary_messages for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.ask_gary_conversations c where c.id = conversation_id and c.user_id = auth.uid())
  );
