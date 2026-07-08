-- ============================================================================
-- Setup manual: Buckets de Supabase Storage + políticas RLS
-- Ejecutar en el SQL Editor de Supabase.
-- Es IDEMPOTENTE: se puede correr varias veces sin error.
--
-- Corrige el fallo "No se pudo subir la imagen" (avatares, logos, comprobantes).
-- Causa raíz: los buckets no existen, no son públicos, o les falta la política
-- de INSERT/UPDATE para el rol `authenticated`. La subida se hace desde el
-- navegador con la sesión del usuario (rol `authenticated`), así que las
-- políticas RLS de `storage.objects` deben permitirlo explícitamente.
--
-- Buckets usados por la app (ver src/components/**/*Upload*.tsx):
--   - avatars       -> foto de perfil del cliente         (subida: authenticated)
--   - logos         -> logo / portada de la empresa       (subida: authenticated)
--   - comprobantes  -> comprobantes de pago y adjuntos     (subida: authenticated)
-- ============================================================================

-- 1) Crear los buckets como PÚBLICOS -----------------------------------------
--    (público = lectura anónima; la escritura sigue gobernada por RLS abajo).
--    El límite de tamaño refleja los máximos del front (3-5 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',      'avatars',      true, 5242880,  array['image/jpeg','image/png','image/webp']),
  ('logos',        'logos',        true, 5242880,  array['image/jpeg','image/png','image/webp']),
  ('comprobantes', 'comprobantes', true, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) Políticas RLS sobre storage.objects -------------------------------------
--    RLS ya viene habilitado por defecto en storage.objects en Supabase.
--    Se recrean las políticas de forma idempotente (drop + create).

-- 2a) Lectura pública de los tres buckets (para <img src> / getPublicUrl).
drop policy if exists "pase_public_read" on storage.objects;
create policy "pase_public_read"
  on storage.objects for select
  to public
  using ( bucket_id in ('avatars','logos','comprobantes') );

-- 2b) Subida (INSERT) para usuarios autenticados.
drop policy if exists "pase_authenticated_insert" on storage.objects;
create policy "pase_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id in ('avatars','logos','comprobantes') );

-- 2c) Sobrescritura (UPDATE) para usuarios autenticados (upsert: true).
drop policy if exists "pase_authenticated_update" on storage.objects;
create policy "pase_authenticated_update"
  on storage.objects for update
  to authenticated
  using ( bucket_id in ('avatars','logos','comprobantes') )
  with check ( bucket_id in ('avatars','logos','comprobantes') );

-- 2d) Borrado (DELETE) para usuarios autenticados (limpieza de reemplazos).
drop policy if exists "pase_authenticated_delete" on storage.objects;
create policy "pase_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id in ('avatars','logos','comprobantes') );

-- ============================================================================
-- Verificación (opcional): las tres filas deben aparecer y `public` = true.
--   select id, public, file_size_limit from storage.buckets
--   where id in ('avatars','logos','comprobantes');
-- Y las políticas:
--   select policyname, cmd, roles from pg_policies
--   where schemaname = 'storage' and tablename = 'objects'
--     and policyname like 'pase_%';
-- ============================================================================
