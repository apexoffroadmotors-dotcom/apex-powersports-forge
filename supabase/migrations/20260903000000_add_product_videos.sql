insert into storage.buckets (id, name, public, file_size_limit)
values ('product-videos', 'product-videos', false, 209715200)
on conflict (id) do nothing;

alter table public.products add column if not exists videos text[] not null default '{}';

create policy "product videos admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-videos' and public.has_role(auth.uid(),'admin'));
create policy "product videos admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-videos' and public.has_role(auth.uid(),'admin'));
create policy "product videos admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-videos' and public.has_role(auth.uid(),'admin'));
create policy "product videos public read" on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-videos');
