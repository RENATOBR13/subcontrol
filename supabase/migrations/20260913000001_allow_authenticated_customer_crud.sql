-- Allow signed-in users to manage customers from the application.
alter table public.customers enable row level security;

grant select, insert, update, delete on table public.customers to authenticated;

drop policy if exists "Authenticated users can read customers" on public.customers;
create policy "Authenticated users can read customers"
on public.customers
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can create customers" on public.customers;
create policy "Authenticated users can create customers"
on public.customers
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update customers" on public.customers;
create policy "Authenticated users can update customers"
on public.customers
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete customers" on public.customers;
create policy "Authenticated users can delete customers"
on public.customers
for delete
to authenticated
using (true);
