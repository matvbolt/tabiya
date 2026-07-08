-- migration_14: time controls for online games.
-- Adds a time-control id plus per-side remaining time (ms). Existing rows
-- default to 'off' (no clock), so old games keep working.

alter table public.games
  add column if not exists time_control text not null default 'off';

alter table public.games
  add column if not exists white_ms integer;

alter table public.games
  add column if not exists black_ms integer;
