-- Tabiya — migration 12. Storage bucket for article/comment images & gifs.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select to public using (bucket_id = 'media');

drop policy if exists "media upload own" on storage.objects;
create policy "media upload own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
