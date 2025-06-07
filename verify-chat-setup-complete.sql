-- Verificar que el setup del chat se ejecutó correctamente

-- 1. Verificar que las tablas fueron creadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('chat_messages', 'room_users')
ORDER BY table_name;

-- 2. Verificar columnas de chat_messages
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- 3. Verificar columnas de room_users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'room_users'
ORDER BY ordinal_position;

-- 4. Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('chat_messages', 'room_users');

-- 5. Contar políticas RLS
SELECT tablename, COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('chat_messages', 'room_users')
GROUP BY tablename;

-- 6. Verificar que las vistas existen
SELECT table_name, table_type 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('chat_messages_with_profiles', 'active_room_users');

-- 7. Verificar realtime está habilitado
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('chat_messages', 'room_users');

-- Mensaje de éxito
SELECT 'Setup del chat completado exitosamente!' as status;
