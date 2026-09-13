-- Keep the customers table synchronized with Supabase Auth users.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.customers (id, name, email, status, notes)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.email,
    'ativo',
    ''
  )
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Backfill users created before this trigger was installed.
insert into public.customers (id, name, email, status, notes)
select
  users.id,
  coalesce(nullif(users.raw_user_meta_data ->> 'name', ''), split_part(users.email, '@', 1)),
  users.email,
  'ativo',
  ''
from auth.users as users
where users.email is not null
  and not exists (
    select 1
    from public.customers as customers
    where customers.id = users.id
       or lower(customers.email) = lower(users.email)
  );
