-- MacroSnap schema. Row Level Security on every table: a user only sees and changes their own rows.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  k text,
  intended_plan text,
  source jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  goals jsonb not null default '{"kcal":2000,"protein":130,"carbs":220,"fat":70}'::jsonb,
  tz_offset int not null default 0,
  seen_unlock boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  photo_path text,
  items jsonb not null default '[]'::jsonb,
  kcal int not null default 0,
  protein numeric(6,1) not null default 0,
  carbs numeric(6,1) not null default 0,
  fat numeric(6,1) not null default 0,
  insight text,
  confidence text,
  eaten_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists meals_user_eaten on public.meals (user_id, eaten_at desc);

-- every AI scan made by a user, for quotas (deleting a meal does not refund a scan)
create table if not exists public.scan_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists scan_events_user on public.scan_events (user_id, created_at desc);

-- scans made before sign-up (server only, through the service role)
create table if not exists public.tries (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  ip_hash text not null,
  result jsonb not null,
  photo_path text,
  claimed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists tries_device on public.tries (device_id, created_at desc);
create index if not exists tries_ip on public.tries (ip_hash, created_at desc);

alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.scan_events enable row level security;
alter table public.tries enable row level security; -- no policy: only the service role reads it

create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "own meals read" on public.meals for select using (auth.uid() = user_id);
create policy "own meals update" on public.meals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own meals delete" on public.meals for delete using (auth.uid() = user_id);
-- meals are inserted by the server after a counted scan (service role), never directly by the browser

create policy "own scans read" on public.scan_events for select using (auth.uid() = user_id);

-- a profile row for every new account
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- private photo bucket: path = <user_id>/<meal_id>.jpg (tries/<try_id>.jpg before sign-up)
insert into storage.buckets (id, name, public) values ('meals', 'meals', false) on conflict (id) do nothing;

create policy "own photos read" on storage.objects for select
  using (bucket_id = 'meals' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own photos delete" on storage.objects for delete
  using (bucket_id = 'meals' and (storage.foldername(name))[1] = auth.uid()::text);
