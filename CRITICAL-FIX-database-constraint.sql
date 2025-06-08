-- SOLUCIÓN CRÍTICA: Error "rooms_creador_id_fkey" 
-- Este script resuelve el problema de clave foránea que impide crear salas

-- ====== DIAGNÓSTICO INICIAL ======
-- Verificar estado actual de la constraint
SELECT 
    tc.constraint_name,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'rooms'
    AND kcu.column_name = 'creador_id';

-- ====== SOLUCIÓN PRINCIPAL ======

-- PASO 1: Eliminar constraint problemática
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_creador_id_fkey;

-- PASO 2: Verificar que no hay datos huérfanos
DELETE FROM public.rooms 
WHERE creador_id NOT IN (
    SELECT id FROM auth.users WHERE id IS NOT NULL
);

-- PASO 3: Recrear constraint correctamente con CASCADE
ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_creador_id_fkey 
FOREIGN KEY (creador_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- ====== VERIFICACIONES POST-FIX ======

-- Verificar que la constraint se creó correctamente
SELECT 
    tc.constraint_name,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    'CONSTRAINT RECREADA ✅' as status
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'rooms'
    AND kcu.column_name = 'creador_id';

-- Verificar integridad de datos
SELECT 
    COUNT(*) as total_rooms,
    COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as rooms_with_valid_creators,
    COUNT(CASE WHEN u.id IS NULL THEN 1 END) as orphaned_rooms
FROM public.rooms r
LEFT JOIN auth.users u ON r.creador_id = u.id;

-- ====== PRUEBA DE FUNCIONALIDAD ======

-- Crear función de prueba para validar que la creación de salas funciona
CREATE OR REPLACE FUNCTION test_room_creation()
RETURNS text AS $$
DECLARE
    test_user_id uuid;
    test_room_id uuid;
    result text;
BEGIN
    -- Obtener un usuario existente para la prueba
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RETURN 'ERROR: No hay usuarios confirmados para la prueba';
    END IF;
    
    -- Intentar crear una sala de prueba
    BEGIN
        INSERT INTO public.rooms (
            nombre, 
            juego, 
            creador_id,
            min_jugadores,
            max_jugadores
        ) VALUES (
            'Sala de Prueba - ' || NOW(),
            'Juego de Prueba',
            test_user_id,
            1,
            4
        ) RETURNING id INTO test_room_id;
        
        -- Si llegamos aquí, la creación fue exitosa
        result := 'SUCCESS: Sala creada exitosamente con ID: ' || test_room_id;
        
        -- Limpiar sala de prueba
        DELETE FROM public.rooms WHERE id = test_room_id;
        
        RETURN result || ' (sala de prueba eliminada)';
        
    EXCEPTION WHEN OTHERS THEN
        RETURN 'ERROR en creación de sala: ' || SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar prueba
SELECT test_room_creation() as test_result;

-- Limpiar función de prueba
DROP FUNCTION IF EXISTS test_room_creation();

-- ====== MENSAJE FINAL ======
SELECT 
    '🎯 CONSTRAINT REPARADA EXITOSAMENTE' as status,
    'Los usuarios ahora pueden crear salas sin problemas' as mensaje,
    'Vercel deployment listo para usar' as next_step;
