-- Script para verificar que el sistema de auto-limpieza esté funcionando
-- Ejecutar este script después de supabase-auto-cleanup-rooms.sql

-- 1. Verificar que las funciones se crearon correctamente
SELECT 'Verificando funciones de auto-limpieza...' as check_step;

SELECT 
    routine_name,
    routine_type,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('cleanup_empty_rooms', 'trigger_cleanup_on_user_leave', 'scheduled_room_cleanup', 'get_popular_rooms');

-- 2. Verificar que la vista rooms_with_user_count existe
SELECT 'Verificando vista rooms_with_user_count...' as check_step;

SELECT 
    table_name as view_name,
    'EXISTS' as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'rooms_with_user_count';

-- 3. Verificar que el trigger se creó
SELECT 'Verificando trigger de auto-limpieza...' as check_step;

SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    'EXISTS' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'trigger_cleanup_empty_rooms';

-- 4. Verificar índices
SELECT 'Verificando índices de rendimiento...' as check_step;

SELECT 
    indexname,
    tablename,
    'EXISTS' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN ('idx_room_users_active_last_seen', 'idx_rooms_created_at');

-- 5. Probar la vista rooms_with_user_count
SELECT 'Probando vista rooms_with_user_count...' as check_step;

SELECT 
    id,
    nombre,
    juego,
    active_users_count,
    total_users_count,
    room_status
FROM rooms_with_user_count 
ORDER BY active_users_count DESC, created_at DESC
LIMIT 5;

-- 6. Probar función get_popular_rooms
SELECT 'Probando función get_popular_rooms...' as check_step;

SELECT * FROM get_popular_rooms(3);

-- 7. Verificar permisos
SELECT 'Verificando permisos...' as check_step;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges 
WHERE routine_schema = 'public' 
AND routine_name IN ('cleanup_empty_rooms', 'scheduled_room_cleanup', 'get_popular_rooms')
AND grantee = 'authenticated';

-- 8. Mensaje final
SELECT '✅ Verificación de auto-limpieza completada!' as final_status,
       'El sistema está listo para eliminar salas vacías automáticamente' as descripcion;
