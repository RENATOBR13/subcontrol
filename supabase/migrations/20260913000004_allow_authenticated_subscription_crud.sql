-- Allow signed-in users to manage subscriptions from the application.
alter table public.subscriptions enable row level security;

grant select, insert, update, delete on table public.subscriptions to authenticated;

drop policy if exists "Authenticated users can read subscriptions" on public.subscriptions;
create policy "Authenticated users can read subscriptions"
on public.subscriptions
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can create subscriptions" on public.subscriptions;
create policy "Authenticated users can create subscriptions"
on public.subscriptions
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update subscriptions" on public.subscriptions;
create policy "Authenticated users can update subscriptions"
on public.subscriptions
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete subscriptions" on public.subscriptions;
create policy "Authenticated users can delete subscriptions"
on public.subscriptions
for delete
to authenticated
using (true);
