-- Tabiya — database schema. Paste this whole file into the Supabase
-- SQL Editor (Dashboard → SQL → New query → Run) once, on a fresh project.
-- Safe to re-run: it uses "if not exists" / "or replace" where possible.

-- =====================================================================
-- profiles: one row per auth user, created automatically on sign-up.
-- =====================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  rating      integer not null default 0,
  games_played integer not null default 0,
  wins        integer not null default 0,
  losses      integer not null default 0,
  draws       integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can read profiles (needed for opponents, leaderboards).
create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- You may only edit your own profile.
create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile whenever a new auth user appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- friendships: directed request that becomes mutual once accepted.
-- =====================================================================
create table if not exists public.friendships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  friend_id  uuid not null references public.profiles (id) on delete cascade,
  status     text not null default 'pending'
             check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  unique (user_id, friend_id)
);

alter table public.friendships enable row level security;

create policy "see friendships you are part of"
  on public.friendships for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "create friend requests as yourself"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Either side can update (accept / block) a friendship they're in.
create policy "update friendships you are part of"
  on public.friendships for update
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "delete friendships you are part of"
  on public.friendships for delete
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- =====================================================================
-- games: one row per match (online rated/training or vs-bot).
-- =====================================================================
create table if not exists public.games (
  id          uuid primary key default gen_random_uuid(),
  white_id    uuid references public.profiles (id) on delete set null,
  black_id    uuid references public.profiles (id) on delete set null,
  opponent_id uuid references public.profiles (id) on delete set null,
  mode        text not null default 'rated'
              check (mode in ('rated', 'training', 'bot')),
  opening_id  text,                 -- selected opening for training/hints
  fen         text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn         text not null default '',
  status      text not null default 'active'
              check (status in ('waiting', 'active', 'finished', 'aborted')),
  winner      text check (winner in ('white', 'black', 'draw')),
  turn        text not null default 'white' check (turn in ('white', 'black')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.games enable row level security;

-- Players in the game can read it. (Open games in the lobby are handled by a
-- dedicated 'waiting' view policy below.)
create policy "players read their games"
  on public.games for select
  to authenticated
  using (
    auth.uid() = white_id
    or auth.uid() = black_id
    or auth.uid() = opponent_id  -- a friend challenge addressed to you
    or status = 'waiting'        -- matchmaking pool
  );

create policy "create a game you are in"
  on public.games for insert
  to authenticated
  with check (auth.uid() = white_id or auth.uid() = black_id);

-- Players may update their own game (moves, joining an open seat, result).
create policy "players update their games"
  on public.games for update
  to authenticated
  using (
    auth.uid() = white_id
    or auth.uid() = black_id
    or auth.uid() = opponent_id
    or status = 'waiting'
  );

-- =====================================================================
-- game_moves: append-only move log, drives realtime replay/sync.
-- =====================================================================
create table if not exists public.game_moves (
  id       bigint generated always as identity primary key,
  game_id  uuid not null references public.games (id) on delete cascade,
  ply      integer not null,
  uci      text not null,
  san      text not null,
  fen      text not null,          -- resulting position
  by_id    uuid references public.profiles (id) on delete set null,
  sent_at  timestamptz not null default now(),
  unique (game_id, ply)
);

alter table public.game_moves enable row level security;

create policy "read moves of games you can see"
  on public.game_moves for select
  to authenticated
  using (
    exists (
      select 1 from public.games g
      where g.id = game_id
        and (auth.uid() = g.white_id or auth.uid() = g.black_id or g.status = 'waiting')
    )
  );

create policy "insert your own moves"
  on public.game_moves for insert
  to authenticated
  with check (auth.uid() = by_id);

-- Broadcast row changes over Realtime so both clients update instantly.
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.game_moves;

-- =====================================================================
-- rating_events: one row per player per finished rated game, for history.
-- =====================================================================
create table if not exists public.rating_events (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  game_id      uuid references public.games (id) on delete set null,
  delta        integer not null,
  rating_after integer not null,
  created_at   timestamptz not null default now()
);

alter table public.rating_events enable row level security;

create policy "read own rating events"
  on public.rating_events for select
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- finish_game: atomically record a result and recompute Elo for both
-- players. SECURITY DEFINER so it can update the *opponent's* profile,
-- which RLS otherwise forbids. Either player may call it; it no-ops if the
-- game is already finished (prevents double rating changes).
-- =====================================================================
create or replace function public.finish_game(p_game_id uuid, p_winner text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  g            public.games;
  ra           integer;  -- white rating
  rb           integer;  -- black rating
  ea           numeric;  -- expected score white
  sa           numeric;  -- actual score white
  k            constant integer := 32;
  new_ra       integer;
  new_rb       integer;
begin
  select * into g from public.games where id = p_game_id for update;
  if g is null then raise exception 'game not found'; end if;
  if g.status = 'finished' then return; end if;           -- already scored
  if auth.uid() not in (g.white_id, g.black_id) then
    raise exception 'not a player in this game';
  end if;
  if p_winner not in ('white', 'black', 'draw') then
    raise exception 'bad winner';
  end if;

  update public.games
    set status = 'finished', winner = p_winner, updated_at = now()
    where id = p_game_id;

  -- Only rated games with two real players affect Elo.
  if g.mode <> 'rated' or g.white_id is null or g.black_id is null then
    return;
  end if;

  select rating into ra from public.profiles where id = g.white_id;
  select rating into rb from public.profiles where id = g.black_id;
  ea := 1.0 / (1.0 + power(10, (rb - ra) / 400.0));
  sa := case p_winner when 'white' then 1.0 when 'black' then 0.0 else 0.5 end;
  new_ra := round(ra + k * (sa - ea));
  new_rb := round(rb + k * ((1.0 - sa) - (1.0 - ea)));

  update public.profiles set
    rating = new_ra,
    games_played = games_played + 1,
    wins   = wins   + (p_winner = 'white')::int,
    losses = losses + (p_winner = 'black')::int,
    draws  = draws  + (p_winner = 'draw')::int
    where id = g.white_id;

  update public.profiles set
    rating = new_rb,
    games_played = games_played + 1,
    wins   = wins   + (p_winner = 'black')::int,
    losses = losses + (p_winner = 'white')::int,
    draws  = draws  + (p_winner = 'draw')::int
    where id = g.black_id;

  insert into public.rating_events (user_id, game_id, delta, rating_after)
  values
    (g.white_id, p_game_id, new_ra - ra, new_ra),
    (g.black_id, p_game_id, new_rb - rb, new_rb);
end;
$$;

grant execute on function public.finish_game(uuid, text) to authenticated;
