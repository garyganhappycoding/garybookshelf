-- Per-buyer locked + watermarked PDFs (e.g. Sains Komputer notes).
alter table public.products add column if not exists personalize_pdf boolean not null default false;
alter table public.orders add column if not exists pdf_password text;
alter table public.orders add column if not exists personal_pdf_path text;

-- private bucket for the generated copies; only the server (service role) reads and writes it
insert into storage.buckets (id, name, public)
values ('personal-copies', 'personal-copies', false)
on conflict (id) do nothing;
