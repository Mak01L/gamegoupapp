-- Configuración de RLS para la tabla 'rooms'
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Verificar políticas existentes para la tabla rooms
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
WHERE tablename = 'rooms' AND schemaname = 'public';

-- 2. Verificar si RLS está habilitado en la tabla rooms
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'rooms' AND schemaname = 'public';

-- 3. Eliminar políticas existentes si existen (para empezar limpio)
DROP POLICY IF EXISTS "Users can view all rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON public.rooms;
DROP POLICY IF EXISTS "Room creators can delete their rooms" ON public.rooms;

-- 4. Crear políticas para la tabla rooms

-- Política de lectura: cualquier usuario puede ver las salas
CREATE POLICY "Users can view all rooms" ON public.rooms
FOR SELECT 
USING (true);

-- Política de inserción: usuarios autenticados pueden crear salas
CREATE POLICY "Authenticated users can create rooms" ON public.rooms
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = creador_id
);

-- Política de actualización: solo el creador puede actualizar su sala
CREATE POLICY "Room creators can update their rooms" ON public.rooms
FOR UPDATE 
USING (
  auth.role() = 'authenticated' 
  AND auth.uid() = creador_id
)
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = creador_id
);

-- Política de eliminación: solo el creador puede eliminar su sala
CREATE POLICY "Room creators can delete their rooms" ON public.rooms
FOR DELETE 
USING (
  auth.role() = 'authenticated' 
  AND auth.uid() = creador_id
);

-- 5. Verificar que las políticas fueron creadas correctamente
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'rooms' AND schemaname = 'public';

-- 6. Verificar que RLS está habilitado (debería ser true)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'rooms' AND schemaname = 'public';
