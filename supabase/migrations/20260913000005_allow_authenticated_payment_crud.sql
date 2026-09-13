-- Allow signed-in users to manage payments from the application.
alter table public.payments enable row level security;

grant select, insert, update, delete on table public.payments to authenticated;

drop policy if exists "Authenticated users can read payments" on public.payments;
create policy "Authenticated users can read payments"
on public.payments
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can create payments" on public.payments;
create policy "Authenticated users can create payments"
on public.payments
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update payments" on public.payments;
create policy "Authenticated users can update payments"
on public.payments
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete payments" on public.payments;
create policy "Authenticated users can delete payments"
on public.payments
for delete
to authenticated
using (true);
