-- Tabiya — migration 08. Saved partner coupons. Run in SQL Editor.

create table if not exists public.redemptions (
  user_id    uuid references public.profiles (id) on delete cascade,
  partner    text not null,
  code       text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, partner)
);
alter table public.redemptions enable row level security;

drop policy if exists "redemptions read own" on public.redemptions;
create policy "redemptions read own"
  on public.redemptions for select to authenticated using (auth.uid() = user_id);

drop policy if exists "redemptions insert own" on public.redemptions;
create policy "redemptions insert own"
  on public.redemptions for insert to authenticated with check (auth.uid() = user_id);
