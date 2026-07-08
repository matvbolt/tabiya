-- Tabiya — migration 02 (self-healing). Run in the Supabase SQL Editor.
-- Adds any missing profile columns, resets ratings to 0, and adds the
-- opponent_id column + policies used for friend challenges & matchmaking.

-- Ensure the profiles table has every column the app expects ------------
alter table public.profiles add column if not exists rating       integer not null default 0;
alter table public.profiles add column if not exists games_played integer not null default 0;
alter table public.profiles add column if not exists wins         integer not null default 0;
alter table public.profiles add column if not exists losses       integer not null default 0;
alter table public.profiles add column if not exists draws        integer not null default 0;
alter table public.profiles add column if not exists avatar_url   text;

-- Ratings start at 0 (and reset existing accounts) ----------------------
alter table public.profiles alter column rating set default 0;
update public.profiles set rating = 0 where rating is distinct from 0;

-- Directed challenges ----------------------------------------------------
-- opponent_id null  => open matchmaking game (quick match pool)
-- opponent_id set   => private challenge; only that friend should join
alter table public.games
  add column if not exists opponent_id uuid
  references public.profiles (id) on delete set null;

-- Let an invited opponent read/join a challenge addressed to them.
drop policy if exists "players read their games" on public.games;
create policy "players read their games"
  on public.games for select
  to authenticated
  using (
    auth.uid() = white_id
    or auth.uid() = black_id
    or auth.uid() = opponent_id
    or status = 'waiting'
  );

drop policy if exists "players update their games" on public.games;
create policy "players update their games"
  on public.games for update
  to authenticated
  using (
    auth.uid() = white_id
    or auth.uid() = black_id
    or auth.uid() = opponent_id
    or status = 'waiting'
  );
