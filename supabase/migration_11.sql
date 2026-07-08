-- Tabiya — migration 11. Let anyone view a player's rating history so public
-- profiles show the full stats (ratings are not sensitive).

drop policy if exists "read own rating events" on public.rating_events;
drop policy if exists "read rating events" on public.rating_events;
create policy "read rating events"
  on public.rating_events for select to authenticated using (true);
