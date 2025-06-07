-- Verificar si las tablas del chat están configuradas

-- 1. Verificar si existen las tablas del chat
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('chat_messages', 'room_users')
ORDER BY table_name;

-- 2. Verificar estructura de chat_messages
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- 3. Verificar estructura de room_users
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'room_users'
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS para chat_messages
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'chat_messages';

-- 5. Verificar políticas RLS para room_users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'room_users';

-- 6. Verificar si las vistas existen
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('chat_messages_with_profiles', 'active_room_users')
ORDER BY table_name;

-- 7. Verificar realtime en las tablas
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
    AND tablename IN ('chat_messages', 'room_users');

-- 8. Contar datos de prueba (si existen)
SELECT 
    'chat_messages' as tabla,
    COUNT(*) as total_registros
FROM public.chat_messages
UNION ALL
SELECT 
    'room_users' as tabla,
    COUNT(*) as total_registros
FROM public.room_users;
