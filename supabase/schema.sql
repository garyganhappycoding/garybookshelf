-- ============================================================
-- garybookshelf: full database schema + RLS policies
-- Run this once in Supabase SQL Editor (Project -> SQL Editor -> New query)
-- ============================================================

-- 1. PROFILES ---------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "profiles: users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;


-- 2. PRODUCTS -----------------------------------------------------
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price_myr numeric(10,2) not null,
  image_url text,
  file_path text not null, -- path inside the private "digital-assets" bucket
  category text default 'notes' check (category in ('notes', 'course', 'template', 'other')),
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

create policy "products: anyone can view published products"
  on public.products for select
  using (is_published = true or public.is_admin());

create policy "products: admin can insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products: admin can update"
  on public.products for update
  using (public.is_admin());

create policy "products: admin can delete"
  on public.products for delete
  using (public.is_admin());


-- 3. ORDERS ---------------------------------------------------------
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  amount_paid numeric(10,2) not null,
  receipt_path text not null, -- path inside the private "receipts" bucket
  status text default 'pending_verification' check (status in ('pending_verification', 'completed', 'rejected')),
  reject_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone
);

alter table public.orders enable row level security;

create policy "orders: customers can view own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "orders: customers can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "orders: admin can update orders"
  on public.orders for update
  using (public.is_admin());


-- 4. STORAGE BUCKETS --------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('digital-assets', 'digital-assets', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- product-images: public read, admin write
create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product-images: admin write"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images: admin update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "product-images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- digital-assets: admin only (customers get signed URLs via server code, never direct access)
create policy "digital-assets: admin all"
  on storage.objects for all
  using (bucket_id = 'digital-assets' and public.is_admin());

-- receipts: customers can upload their own, admin can read all
create policy "receipts: customer upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "receipts: customer read own"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ============================================================
-- Done. Next: make your own account an admin (see README step 5).
-- ============================================================
