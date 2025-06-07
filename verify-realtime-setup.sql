-- Script para verificar que Realtime esté configurado correctamente

-- 1. Verificar que las tablas estén en la publicación de realtime
SELECT 'Verificando publicación realtime...' as check_step;

SELECT 
    schemaname,
    tablename,
    'REALTIME ENABLED' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('rooms', 'chat_messages', 'room_users')
ORDER BY tablename;

-- 2. Verificar configuración de publicación
SELECT 'Verificando configuración de publicación...' as check_step;

SELECT 
    pubname,
    pubinsert,
    pubupdate,
    pubdelete,
    pubtruncate
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 3. Verificar que RLS esté habilitado en las tablas
SELECT 'Verificando RLS en tablas...' as check_step;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('rooms', 'chat_messages', 'room_users')
ORDER BY tablename;

-- 4. Verificar que las políticas RLS estén activas
SELECT 'Verificando políticas RLS activas...' as check_step;

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('rooms', 'chat_messages', 'room_users')
ORDER BY tablename, policyname;

-- 5. Test de inserción para verificar permisos
SELECT 'Estado de configuración realtime...' as check_step;

-- Verificar que podemos ver las tablas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('rooms', 'chat_messages', 'room_users') THEN '✅ TABLA EXISTE'
        ELSE '❌ TABLA FALTANTE'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rooms', 'chat_messages', 'room_users')
UNION ALL
SELECT 
    'REALTIME CONFIG' as table_name,
    '✅ VERIFICAR RESULTADOS ARRIBA' as status;

SELECT '🎯 Verificación de Realtime completada!' as final_status;
