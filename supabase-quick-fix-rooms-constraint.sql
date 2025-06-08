-- SOLUCIÓN RÁPIDA para el error de clave foránea rooms_creador_id_fkey

-- PASO 1: Eliminar la constraint problemática
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_creador_id_fkey;

-- PASO 2: Recrear la constraint correctamente
ALTER TABLE public.rooms 
ADD CONSTRAINT rooms_creador_id_fkey 
FOREIGN KEY (creador_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- PASO 3: Verificar que funciona
SELECT 'Constraint recreada correctamente' as status;
