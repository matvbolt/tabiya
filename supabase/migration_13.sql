-- Tabiya — migration 13. Edit articles/comments + timestamps.

alter table public.articles add column if not exists updated_at timestamptz not null default now();
alter table public.article_comments add column if not exists updated_at timestamptz not null default now();

drop policy if exists "comments update own" on public.article_comments;
create policy "comments update own"
  on public.article_comments for update to authenticated using (auth.uid() = author_id);
