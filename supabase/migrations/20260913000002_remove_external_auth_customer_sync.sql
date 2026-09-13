-- Stop importing users created outside the application into customers.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_auth_user();
