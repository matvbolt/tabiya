-- Tabiya — migration 15. Let authors delete their own articles, and let
-- users delete their own avatar files from storage. Run in the SQL Editor.

drop policy if exists "articles delete own" on public.articles;
create policy "articles delete own"
  on public.articles for delete to authenticated using (auth.uid() = author_id);

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
