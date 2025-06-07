-- Script simplificado para crear la vista rooms_with_user_count
-- Este script crea solo lo esencial para que funcione la búsqueda mejorada

-- 1. Crear la vista rooms_with_user_count
CREATE OR REPLACE VIEW rooms_with_user_count AS
SELECT 
  r.*,
  COALESCE(active_users.count, 0)::bigint as active_users_count,
  COALESCE(total_users.count, 0)::bigint as total_users_count,
  CASE 
    WHEN COALESCE(active_users.count, 0) = 0 THEN 'EMPTY'
    WHEN COALESCE(active_users.count, 0) = 1 THEN 'SINGLE_USER'
    ELSE 'ACTIVE'
  END as room_status
FROM rooms r
LEFT JOIN (
  SELECT room_id, COUNT(*) as count
  FROM room_users 
  WHERE is_active = true 
  AND last_seen > NOW() - INTERVAL '10 minutes'
  GROUP BY room_id
) active_users ON r.id = active_users.room_id
LEFT JOIN (
  SELECT room_id, COUNT(*) as count
  FROM room_users 
  GROUP BY room_id
) total_users ON r.id = total_users.room_id
ORDER BY COALESCE(active_users.count, 0) DESC, r.created_at DESC;

-- 2. Asegurar que la vista tenga los permisos correctos
GRANT SELECT ON rooms_with_user_count TO authenticated;
GRANT SELECT ON rooms_with_user_count TO anon;

-- 3. Crear función simple para limpiar salas vacías (opcional, se puede ejecutar manualmente)
CREATE OR REPLACE FUNCTION cleanup_empty_rooms()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
  -- Eliminar salas que no tienen usuarios activos hace más de 30 minutos
  DELETE FROM rooms 
  WHERE id NOT IN (
    SELECT DISTINCT room_id 
    FROM room_users 
    WHERE is_active = true 
    AND last_seen > NOW() - INTERVAL '30 minutes'
  )
  AND created_at < NOW() - INTERVAL '60 minutes'; -- No eliminar salas muy nuevas
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION cleanup_empty_rooms() TO authenticated;

-- 5. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_room_users_active_last_seen 
ON room_users(room_id, is_active, last_seen);

CREATE INDEX IF NOT EXISTS idx_rooms_created_at 
ON rooms(created_at);

-- 6. Función para marcar usuarios inactivos
CREATE OR REPLACE FUNCTION mark_inactive_users()
RETURNS integer AS $$
DECLARE
    updated_count integer;
BEGIN
  -- Marcar como inactivos usuarios que no han actualizado last_seen en 15 minutos
  UPDATE room_users 
  SET is_active = false 
  WHERE is_active = true 
  AND last_seen < NOW() - INTERVAL '15 minutes';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_inactive_users() TO authenticated;

-- Mensaje de confirmación
SELECT '✅ Vista rooms_with_user_count creada correctamente!' as status,
       'Ahora la búsqueda avanzada debería funcionar' as descripcion;
