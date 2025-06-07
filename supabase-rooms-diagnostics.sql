-- Diagnóstico específico para la tabla 'rooms'
-- Ejecutar este script en Supabase SQL Editor para diagnosticar el problema

-- 1. Verificar si el usuario actual está autenticado
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  current_user as database_user;

-- 2. Verificar la estructura de la tabla rooms
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'rooms'
ORDER BY ordinal_position;

-- 3. Verificar políticas actuales en la tabla rooms
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'rooms' AND schemaname = 'public';

-- 4. Verificar RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  hasrls
FROM pg_tables 
WHERE tablename = 'rooms' AND schemaname = 'public';

-- 5. Intentar una consulta de prueba (SELECT)
SELECT COUNT(*) as total_rooms FROM public.rooms;

-- 6. Verificar permisos en la tabla
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name = 'rooms';

-- 7. Verificar que existe la referencia a profiles
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'rooms';
