-- Configuración simplificada de Storage para el bucket 'avatars'
-- Este script es una alternativa más simple si el primer setup no funciona

-- IMPORTANTE: Ejecutar este script solo después de eliminar las políticas existentes

-- 1. Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar." ON storage.objects;

-- 2. Crear el bucket 'avatars' si no existe (configuración pública y simplificada)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. Crear políticas más simples y permisivas

-- Política de lectura: cualquier usuario autenticado puede leer
CREATE POLICY "Authenticated users can view avatars" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- Política de escritura: cualquier usuario autenticado puede subir
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Política de actualización: cualquier usuario autenticado puede actualizar
CREATE POLICY "Authenticated users can update avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');

-- Política de eliminación: cualquier usuario autenticado puede eliminar
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- 4. También agregar acceso público para lectura (opcional)
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Verificaciones
SELECT 'Bucket creado/actualizado' as status, * FROM storage.buckets WHERE id = 'avatars';
SELECT 'Políticas creadas' as status, policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
