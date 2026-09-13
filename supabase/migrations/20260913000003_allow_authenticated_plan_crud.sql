-- Allow signed-in users to manage plans from the application.
alter table public.plans enable row level security;

grant select, insert, update, delete on table public.plans to authenticated;

drop policy if exists "Authenticated users can read plans" on public.plans;
create policy "Authenticated users can read plans"
on public.plans
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can create plans" on public.plans;
create policy "Authenticated users can create plans"
on public.plans
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update plans" on public.plans;
create policy "Authenticated users can update plans"
on public.plans
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete plans" on public.plans;
create policy "Authenticated users can delete plans"
on public.plans
for delete
to authenticated
using (true);
