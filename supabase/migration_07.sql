-- Tabiya — migration 07. Badge ownership + admin coins. Run in SQL Editor.

alter table public.profiles
  add column if not exists owned_badges text[] not null default '{}';

-- Give your account a starting stash (change the username if needed).
update public.profiles set coins = 10000 where username = 'boltchess';
