-- Diagnóstico y solución para error de clave foránea rooms_creador_id_fkey

-- 1. VERIFICAR ESTRUCTURA ACTUAL
-- Revisar si existe la tabla auth.users y su relación con rooms
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='rooms'
    AND kcu.column_name='creador_id';

-- 2. VERIFICAR USUARIOS EXISTENTES
SELECT 
    count(*) as total_users,
    count(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- 3. VERIFICAR SALAS HUÉRFANAS (sin creador válido)
SELECT 
    r.id,
    r.nombre,
    r.creador_id,
    r.created_at,
    CASE 
        WHEN u.id IS NULL THEN 'USUARIO NO EXISTE'
        ELSE 'USUARIO EXISTE'
    END as user_status
FROM public.rooms r
LEFT JOIN auth.users u ON r.creador_id = u.id
WHERE u.id IS NULL;

-- 4. REVISAR ÚLTIMOS INTENTOS DE CREACIÓN
SELECT 
    r.nombre,
    r.creador_id,
    r.created_at,
    u.email,
    u.created_at as user_created_at,
    u.email_confirmed_at
FROM public.rooms r
LEFT JOIN auth.users u ON r.creador_id = u.id
ORDER BY r.created_at DESC
LIMIT 10;

-- 5. SOLUCIÓN 1: ELIMINAR CONSTRAINT PROBLEMÁTICA Y RECREARLA CORRECTAMENTE
-- Primero, eliminar la constraint existente si causa problemas
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_creador_id_fkey;

-- 6. SOLUCIÓN 2: RECREAR LA CONSTRAINT CORRECTAMENTE
-- Asegurar que apunte a auth.users(id) correctamente
ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_creador_id_fkey 
FOREIGN KEY (creador_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 7. VERIFICAR QUE LA CONSTRAINT SE CREÓ CORRECTAMENTE
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='rooms'
    AND kcu.column_name='creador_id';

-- 8. SOLUCIÓN ALTERNATIVA: HACER EL CAMPO NULLABLE TEMPORALMENTE
-- Si el problema persiste, podemos hacer creador_id nullable temporalmente
-- ALTER TABLE public.rooms ALTER COLUMN creador_id DROP NOT NULL;

-- 9. VERIFICAR POLÍTICAS RLS QUE PODRÍAN INTERFERIR
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
WHERE tablename = 'rooms';

-- 10. VERIFICAR SI HAY TRIGGERS QUE INTERFIEREN
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'rooms';
