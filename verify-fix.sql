-- Script simple para verificar que la reparación funcionó

-- Verificar que las tablas existen
SELECT 'Verificando existencia de tablas...' as check_step;

SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_messages', 'room_users');

-- Verificar que la columna is_active existe
SELECT 'Verificando columna is_active...' as check_step;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'room_users'
AND column_name = 'is_active';

-- Verificar que las vistas existen
SELECT 'Verificando vistas...' as check_step;

SELECT 
    table_name as view_name,
    'EXISTS' as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('chat_messages_with_profiles', 'active_room_users');

-- Verificar RLS policies
SELECT 'Verificando políticas RLS...' as check_step;

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('chat_messages', 'room_users')
ORDER BY tablename, policyname;

-- Test de inserción básica (solo estructura, no datos reales)
SELECT 'Verificando estructura de inserción...' as check_step;

-- Mostrar estructura de chat_messages
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- Mostrar estructura de room_users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'room_users'
ORDER BY ordinal_position;

SELECT '✅ Verificación completada!' as final_status;
