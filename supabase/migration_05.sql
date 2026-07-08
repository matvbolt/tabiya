-- Tabiya — migration 05. In-game currency (ChessCoin) + profile badge.
-- Run in the Supabase SQL Editor (after migrations 02 and 03).

alter table public.profiles add column if not exists coins integer not null default 100;
alter table public.profiles add column if not exists badge text;

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
  coin_w  integer;
  coin_b  integer;
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
  coin_w := case p_winner when 'white' then 12 when 'draw' then 6 else 4 end;
  coin_b := case p_winner when 'black' then 12 when 'draw' then 6 else 4 end;

  update public.profiles set
    rating = new_ra,
    coins = coins + coin_w,
    games_played = games_played + 1,
    wins   = wins   + (p_winner = 'white')::int,
    losses = losses + (p_winner = 'black')::int,
    draws  = draws  + (p_winner = 'draw')::int
    where id = g.white_id;

  update public.profiles set
    rating = new_rb,
    coins = coins + coin_b,
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
