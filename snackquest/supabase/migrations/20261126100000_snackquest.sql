-- SnackQuest schema. Row Level Security on every table: a user only sees and changes their own rows.
-- Writes that award points or count quotas go through the server (service role), never the browser.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  k text,
  intended_plan text,
  source jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  gamer_tag text,
  steam_id text,
  steam_name text,
  steam_avatar text,
  steam_synced_at timestamptz,
  tz_offset int not null default 0,
  seen_unlock boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- a quest run: the RESULT built in onboarding (and each "cook up more" batch)
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  game text not null,
  snack text not null,
  goal_reward_id int,
  share_token text unique default encode(gen_random_bytes(9), 'hex'),
  created_at timestamptz not null default now()
);
create index if not exists runs_user on public.runs (user_id, created_at desc);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  run_id uuid references public.runs (id) on delete cascade,
  position int not null default 0,
  title text not null,
  rule text not null,
  proof text not null,
  rarity text not null default 'common' check (rarity in ('common','rare','legendary')),
  points int not null default 40,
  custom boolean not null default false,
  status text not null default 'open' check (status in ('open','done')),
  photo_path text,
  verdict text,
  awarded int,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists quests_user on public.quests (user_id, status, created_at desc);

-- every point won or spent; the balance is the sum
create table if not exists public.points (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount int not null,
  kind text not null check (kind in ('quest','session','steam','redeem','refund','bonus')),
  ref text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists points_user on public.points (user_id, created_at desc);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  source text not null default 'manual' check (source in ('manual','steam')),
  steam_appid int,
  steam_minutes_total int,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game text not null,
  source text not null default 'timer' check (source in ('timer','steam')),
  started_at timestamptz not null default now(),
  last_beat timestamptz not null default now(),
  ended_at timestamptz,
  minutes int not null default 0,
  awarded int not null default 0
);
create index if not exists sessions_user on public.sessions (user_id, started_at desc);

-- the Reward Shop catalog (edited by the owner in Supabase); everyone signed in can read it
create table if not exists public.rewards (
  id int generated always as identity primary key,
  name text not null,
  kind text not null,
  blurb text not null default '',
  cost int not null,
  icon text not null default 'gift',
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reward_id int not null references public.rewards (id),
  reward_name text not null,
  cost int not null,
  status text not null default 'requested' check (status in ('requested','processing','shipped','delivered','canceled')),
  ship_to jsonb not null default '{}'::jsonb,
  tracking text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists redemptions_user on public.redemptions (user_id, created_at desc);

-- every AI call, for quotas and abuse limits
create table if not exists public.ai_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_events_user on public.ai_events (user_id, kind, created_at desc);

alter table public.profiles enable row level security;
alter table public.runs enable row level security;
alter table public.quests enable row level security;
alter table public.points enable row level security;
alter table public.games enable row level security;
alter table public.sessions enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;
alter table public.ai_events enable row level security;

create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own runs read" on public.runs for select using (auth.uid() = user_id);
create policy "own quests read" on public.quests for select using (auth.uid() = user_id);
create policy "own points read" on public.points for select using (auth.uid() = user_id);
create policy "own games read" on public.games for select using (auth.uid() = user_id);
create policy "own games delete" on public.games for delete using (auth.uid() = user_id);
create policy "own sessions read" on public.sessions for select using (auth.uid() = user_id);
create policy "own redemptions read" on public.redemptions for select using (auth.uid() = user_id);
create policy "rewards readable" on public.rewards for select to authenticated using (active);
-- profiles, quests, points, sessions, redemptions and ai_events are written by the server (service role) only

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- balance helper (server)
create or replace function public.points_balance(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount), 0)::int from public.points where user_id = uid
$$;
revoke execute on function public.points_balance(uuid) from public, anon, authenticated;

-- private snack-photo bucket: path = <user_id>/<quest_id>.jpg
insert into storage.buckets (id, name, public) values ('proofs', 'proofs', false) on conflict (id) do nothing;
create policy "own proofs read" on storage.objects for select
  using (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);

-- starting catalog (the owner edits costs and items in Supabase → Table editor → rewards)
insert into public.rewards (name, kind, blurb, cost, icon, sort) values
  ('$10 Steam Gift Card', 'Gift card', 'Digital code, sent by email', 3000, 'gift', 1),
  ('$10 PlayStation Store Card', 'Gift card', 'Digital code, sent by email', 3000, 'gift', 2),
  ('$10 Xbox Gift Card', 'Gift card', 'Digital code, sent by email', 3000, 'gift', 3),
  ('Pro Gaming Mouse', 'Gear', 'Wired RGB gaming mouse, shipped to you', 12000, 'mouse', 4),
  ('Wireless Controller', 'Gear', 'For PC, console and mobile, shipped to you', 20000, 'gamepad', 5),
  ('Mechanical Keyboard', 'Gear', 'Compact RGB mechanical keyboard, shipped to you', 24000, 'keyboard', 6),
  ('Pro Gaming Headset', 'Gear', 'Surround-sound headset with mic, shipped to you', 30000, 'headphones', 7);
