-- Configuración de Storage para el bucket 'avatars'
-- Este script debe ejecutarse en Supabase SQL Editor

-- 1. Crear el bucket 'avatars' si no existe (con configuración pública)
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

-- 2. Crear política para permitir que usuarios autenticados lean todos los avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 3. Crear política para permitir que usuarios autenticados suban sus propios avatars
CREATE POLICY "Users can upload their own avatar." ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Crear política para permitir que usuarios actualicen sus propios avatars
CREATE POLICY "Users can update their own avatar." ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Crear política para permitir que usuarios eliminen sus propios avatars
CREATE POLICY "Users can delete their own avatar." ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verificar que el bucket fue creado correctamente
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Verificar las políticas creadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
