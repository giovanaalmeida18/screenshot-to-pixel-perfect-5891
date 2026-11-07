-- Materiais: leitura para usuários autenticados; escrita só para administradores
create policy "Autenticados leem materiais"
  on storage.objects for select to authenticated
  using (bucket_id = 'materiais');
create policy "Administradores enviam materiais"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'materiais' and public.has_role(auth.uid(), 'admin'));
create policy "Administradores atualizam materiais"
  on storage.objects for update to authenticated
  using (bucket_id = 'materiais' and public.has_role(auth.uid(), 'admin'));
create policy "Administradores removem materiais"
  on storage.objects for delete to authenticated
  using (bucket_id = 'materiais' and public.has_role(auth.uid(), 'admin'));

-- Certificados: cada aluno lê apenas os próprios arquivos (pasta = seu id); escrita só para administradores
create policy "Aluno lê o próprio certificado"
  on storage.objects for select to authenticated
  using (bucket_id = 'certificados' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Administradores enviam certificados"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'certificados' and public.has_role(auth.uid(), 'admin'));
create policy "Administradores atualizam certificados"
  on storage.objects for update to authenticated
  using (bucket_id = 'certificados' and public.has_role(auth.uid(), 'admin'));
create policy "Administradores removem certificados"
  on storage.objects for delete to authenticated
  using (bucket_id = 'certificados' and public.has_role(auth.uid(), 'admin'));