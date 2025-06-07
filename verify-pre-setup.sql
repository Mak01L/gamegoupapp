-- Verificar el estado actual de la base de datos antes de ejecutar auto-cleanup

-- 1. Verificar qué vistas existen
SELECT 'Verificando vistas existentes...' as check_step;

SELECT 
    table_name as view_name,
    'EXISTS' as status
FROM information_schema.views 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar qué funciones existen
SELECT 'Verificando funciones existentes...' as check_step;

SELECT 
    routine_name,
    routine_type,
    'EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. Verificar triggers existentes
SELECT 'Verificando triggers existentes...' as check_step;

SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- 4. Verificar que las tablas base existen
SELECT 'Verificando tablas base...' as check_step;

SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rooms', 'room_users', 'chat_messages')
ORDER BY table_name;

SELECT '✅ Verificación pre-setup completada!' as final_status;
