-- Member discount: a product can have a cheaper price for people who already bought another product.
-- Example: English essay pack RM10, but RM5 for anyone with an approved speaking冲刺包 order. One discount per account.
alter table public.products add column if not exists member_discount_product_id uuid references public.products(id) on delete set null;
alter table public.products add column if not exists member_price_myr numeric(10,2);
alter table public.orders add column if not exists discount_applied boolean not null default false;
