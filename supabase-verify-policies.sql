-- Verificación completa de políticas RLS para la tabla 'rooms'

-- 1. Verificar que las políticas están activas
SELECT 
  policyname as "Política",
  cmd as "Comando",
  permissive as "Permisivo",
  CASE 
    WHEN roles = '{authenticated}' THEN 'Usuarios autenticados'
    WHEN roles = '{public}' THEN 'Usuarios públicos'
    ELSE array_to_string(roles, ', ')
  END as "Roles"
FROM pg_policies 
WHERE tablename = 'rooms' AND schemaname = 'public'
ORDER BY cmd;

-- 2. Verificar el estado de RLS
SELECT 
  'RLS Estado' as check_type,
  CASE 
    WHEN rowsecurity THEN 'HABILITADO ✅'
    ELSE 'DESHABILITADO ❌'
  END as status
FROM pg_tables 
WHERE tablename = 'rooms' AND schemaname = 'public';

-- 3. Verificar estructura de la tabla rooms
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rooms' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Test de usuario autenticado (esto debería funcionar si hay un usuario logueado)
-- Nota: Solo funcionará si hay una sesión activa
SELECT 
  'Usuario actual' as info,
  COALESCE(auth.uid()::text, 'No autenticado') as user_id,
  COALESCE(auth.role()::text, 'No disponible') as role;
