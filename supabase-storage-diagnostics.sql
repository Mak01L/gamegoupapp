-- Diagnóstico del Storage de Supabase
-- Ejecutar este script en Supabase SQL Editor para diagnosticar el problema

-- 1. Verificar si el bucket 'avatars' existe
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'avatars';

-- 2. Verificar políticas existentes para storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. Verificar RLS está habilitado en storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 4. Verificar permisos en el bucket
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'storage' 
  AND table_name = 'objects';

-- 5. Verificar la configuración de autenticación actual
SELECT 
  current_user,
  session_user,
  current_setting('role') as current_role;

-- 6. Simular la función que usan las políticas
-- Esto te dirá si storage.foldername funciona correctamente
SELECT storage.foldername('test-user-id/avatar.jpg') as folder_array;

-- 7. Ver todos los archivos actuales en el bucket avatars (si existe)
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'avatars'
LIMIT 10;
