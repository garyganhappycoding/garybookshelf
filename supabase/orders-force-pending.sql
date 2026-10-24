-- NOT APPLIED YET. Stops a logged-in customer from inserting an order that is already "completed"
-- (the insert policy only checks user_id). Run in the Supabase SQL editor after reviewing.
create or replace function public.orders_force_pending()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() in ('authenticated', 'anon') and not public.is_admin() then
    new.status := 'pending_verification';
    new.reviewed_at := null;
    new.reject_reason := null;
    new.pdf_password := null;
    new.personal_pdf_path := null;
    new.link_opened_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_force_pending_trg on public.orders;
create trigger orders_force_pending_trg
  before insert on public.orders
  for each row execute function public.orders_force_pending();
