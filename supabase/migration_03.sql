-- Tabiya — migration 03. Rating history so the profile can show how much a
-- player has gained over time and per game. Run in the Supabase SQL Editor.

create table if not exists public.rating_events (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  game_id      uuid references public.games (id) on delete set null,
  delta        integer not null,          -- rating change from this game
  rating_after integer not null,          -- resulting rating
  created_at   timestamptz not null default now()
);

alter table public.rating_events enable row level security;

drop policy if exists "read own rating events" on public.rating_events;
create policy "read own rating events"
  on public.rating_events for select
  to authenticated
  using (auth.uid() = user_id);

-- Recreate finish_game so it also logs a rating_events row per player.
create or replace function public.finish_game(p_game_id uuid, p_winner text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  g       public.games;
  ra      integer;
  rb      integer;
  ea      numeric;
  sa      numeric;
  k       constant integer := 32;
  new_ra  integer;
  new_rb  integer;
begin
  select * into g from public.games where id = p_game_id for update;
  if g is null then raise exception 'game not found'; end if;
  if g.status = 'finished' then return; end if;
  if auth.uid() not in (g.white_id, g.black_id) then
    raise exception 'not a player in this game';
  end if;
  if p_winner not in ('white', 'black', 'draw') then
    raise exception 'bad winner';
  end if;

  update public.games
    set status = 'finished', winner = p_winner, updated_at = now()
    where id = p_game_id;

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
