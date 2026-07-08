-- Tabiya — migration 10. Comment counts + delete, nickname styles.

alter table public.articles add column if not exists comments integer not null default 0;

create or replace function public.bump_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.articles set comments = comments + 1 where id = new.article_id;
  elsif TG_OP = 'DELETE' then
    update public.articles set comments = greatest(0, comments - 1) where id = old.article_id;
  end if;
  return null;
end;
$$;

drop trigger if exists article_comment_count on public.article_comments;
create trigger article_comment_count
  after insert or delete on public.article_comments
  for each row execute function public.bump_comment_count();

update public.articles a
  set comments = (select count(*) from public.article_comments c where c.article_id = a.id);

drop policy if exists "comments delete" on public.article_comments;
create policy "comments delete"
  on public.article_comments for delete to authenticated
  using (
    auth.uid() = author_id
    or auth.uid() = (select author_id from public.articles where id = article_id)
  );

alter table public.profiles add column if not exists name_style text;
alter table public.profiles add column if not exists owned_styles text[] not null default '{}';
