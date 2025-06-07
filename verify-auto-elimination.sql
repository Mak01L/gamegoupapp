-- Verificar que el sistema de auto-eliminación esté funcionando

-- 1. Verificar que las funciones existen
SELECT 'Verificando funciones...' as step;

SELECT 
    routine_name,
    routine_type,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'check_and_cleanup_empty_room',
    'leave_room_safely',
    'cleanup_inactive_users'
)
ORDER BY routine_name;

-- 2. Verificar que el trigger existe
SELECT 'Verificando triggers...' as step;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    'EXISTS' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'auto_cleanup_on_user_leave';

-- 3. Verificar que la vista actualizada existe
SELECT 'Verificando vista rooms_with_user_count...' as step;

SELECT 
    table_name as view_name,
    'EXISTS' as status
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'rooms_with_user_count';

-- 4. Probar la vista (sin datos sensibles)
SELECT 'Probando vista rooms_with_user_count...' as step;

SELECT 
    COUNT(*) as total_rooms,
    COUNT(CASE WHEN active_users_count > 0 THEN 1 END) as active_rooms,
    COUNT(CASE WHEN active_users_count = 0 THEN 1 END) as empty_rooms
FROM rooms_with_user_count;

-- 5. Verificar permisos
SELECT 'Verificando permisos...' as step;

SELECT 
    routine_name,
    privilege_type,
    grantee
FROM information_schema.routine_privileges 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'check_and_cleanup_empty_room',
    'leave_room_safely',
    'cleanup_inactive_users'
)
AND grantee = 'authenticated'
ORDER BY routine_name;

-- 6. Mensaje final
SELECT '✅ Verificación del sistema de auto-eliminación completada!' as final_status;
