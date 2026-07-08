-- Tabiya — migration 06. Community articles (Learn & Earn). Run in SQL Editor
-- after migration 05 (needs profiles.coins).

create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid references public.profiles (id) on delete cascade,
  title        text not null,
  summary      text,
  body         text not null,
  tag          text,
  premium_cost integer not null default 0,
  likes        integer not null default 0,
  views        integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);
alter table public.articles enable row level security;

drop policy if exists "articles read" on public.articles;
create policy "articles read"
  on public.articles for select to authenticated using (published or auth.uid() = author_id);

drop policy if exists "articles insert own" on public.articles;
create policy "articles insert own"
  on public.articles for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "articles update own" on public.articles;
create policy "articles update own"
  on public.articles for update to authenticated using (auth.uid() = author_id);

create table if not exists public.article_likes (
  user_id    uuid references public.profiles (id) on delete cascade,
  article_id uuid references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);
alter table public.article_likes enable row level security;
drop policy if exists "likes read own" on public.article_likes;
create policy "likes read own"
  on public.article_likes for select to authenticated using (auth.uid() = user_id);

create table if not exists public.article_unlocks (
  user_id    uuid references public.profiles (id) on delete cascade,
  article_id uuid references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);
alter table public.article_unlocks enable row level security;
drop policy if exists "unlocks read own" on public.article_unlocks;
create policy "unlocks read own"
  on public.article_unlocks for select to authenticated using (auth.uid() = user_id);

create or replace function public.like_article(p_article_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare a public.articles;
begin
  select * into a from public.articles where id = p_article_id;
  if a is null then raise exception 'article not found'; end if;
  if exists (select 1 from public.article_likes where user_id = auth.uid() and article_id = p_article_id) then
    return;
  end if;
  insert into public.article_likes (user_id, article_id) values (auth.uid(), p_article_id);
  update public.articles set likes = likes + 1 where id = p_article_id;
  update public.profiles set coins = coins + 2 where id = auth.uid();
  if a.author_id is not null and a.author_id <> auth.uid() then
    update public.profiles set coins = coins + 1 where id = a.author_id;
  end if;
end;
$$;
grant execute on function public.like_article(uuid) to authenticated;

create or replace function public.unlock_article(p_article_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare a public.articles; bal integer;
begin
  select * into a from public.articles where id = p_article_id;
  if a is null then raise exception 'article not found'; end if;
  if a.premium_cost <= 0 then return; end if;
  if exists (select 1 from public.article_unlocks where user_id = auth.uid() and article_id = p_article_id) then
    return;
  end if;
  select coins into bal from public.profiles where id = auth.uid();
  if bal < a.premium_cost then raise exception 'not enough coins'; end if;
  update public.profiles set coins = coins - a.premium_cost where id = auth.uid();
  if a.author_id is not null and a.author_id <> auth.uid() then
    update public.profiles set coins = coins + round(a.premium_cost * 0.7) where id = a.author_id;
  end if;
  insert into public.article_unlocks (user_id, article_id) values (auth.uid(), p_article_id);
end;
$$;
grant execute on function public.unlock_article(uuid) to authenticated;
