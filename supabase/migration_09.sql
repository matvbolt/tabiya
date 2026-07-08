-- Tabiya — migration 09. Article comments. Run in SQL Editor.

create table if not exists public.article_comments (
  id         uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles (id) on delete cascade,
  author_id  uuid references public.profiles (id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);
alter table public.article_comments enable row level security;

drop policy if exists "comments read" on public.article_comments;
create policy "comments read"
  on public.article_comments for select to authenticated using (true);

drop policy if exists "comments insert own" on public.article_comments;
create policy "comments insert own"
  on public.article_comments for insert to authenticated with check (auth.uid() = author_id);
