-- Script para auto-eliminación de salas vacías
-- Este script agrega funcionalidad para eliminar automáticamente salas sin usuarios activos

-- 1. Crear función para limpiar salas vacías
CREATE OR REPLACE FUNCTION cleanup_empty_rooms()
RETURNS void AS $$
BEGIN
  -- Eliminar salas que no tienen usuarios activos hace más de 5 minutos
  DELETE FROM rooms 
  WHERE id NOT IN (
    SELECT DISTINCT room_id 
    FROM room_users 
    WHERE is_active = true 
    AND last_seen > NOW() - INTERVAL '5 minutes'
  )
  AND created_at < NOW() - INTERVAL '10 minutes'; -- No eliminar salas muy nuevas
  
  -- Log de limpieza
  RAISE NOTICE 'Limpieza de salas vacías completada';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear trigger para limpieza automática cuando un usuario sale
CREATE OR REPLACE FUNCTION trigger_cleanup_on_user_leave()
RETURNS trigger AS $$
BEGIN
  -- Si un usuario se vuelve inactivo, verificar si la sala queda vacía
  IF NEW.is_active = false OR OLD.is_active = true AND NEW.is_active = false THEN
    -- Verificar si la sala queda sin usuarios activos
    IF NOT EXISTS (
      SELECT 1 FROM room_users 
      WHERE room_id = NEW.room_id 
      AND is_active = true 
      AND user_id != NEW.user_id
    ) THEN
      -- Eliminar la sala si está vacía por más de 2 minutos
      DELETE FROM rooms 
      WHERE id = NEW.room_id 
      AND created_at < NOW() - INTERVAL '2 minutes';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el trigger
DROP TRIGGER IF EXISTS trigger_cleanup_empty_rooms ON room_users;
CREATE TRIGGER trigger_cleanup_empty_rooms
  AFTER UPDATE ON room_users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_on_user_leave();

-- 4. Crear función para limpieza programada (se puede ejecutar manualmente o con cron)
CREATE OR REPLACE FUNCTION scheduled_room_cleanup()
RETURNS void AS $$
BEGIN
  -- Marcar como inactivos usuarios que no han actualizado last_seen en 10 minutos
  UPDATE room_users 
  SET is_active = false 
  WHERE is_active = true 
  AND last_seen < NOW() - INTERVAL '10 minutes';
  
  -- Eliminar salas completamente vacías (sin usuarios activos)
  DELETE FROM rooms 
  WHERE id NOT IN (
    SELECT DISTINCT room_id 
    FROM room_users 
    WHERE is_active = true
  )
  AND created_at < NOW() - INTERVAL '30 minutes'; -- Dar tiempo para que se unan usuarios
  
  RAISE NOTICE 'Limpieza programada de salas completada';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Vista para monitorear salas y su estado de usuarios
CREATE OR REPLACE VIEW rooms_with_user_count AS
SELECT 
  r.*,
  COALESCE(active_users.count, 0) as active_users_count,
  COALESCE(total_users.count, 0) as total_users_count,
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
  GROUP BY room_id
) active_users ON r.id = active_users.room_id
LEFT JOIN (
  SELECT room_id, COUNT(*) as count
  FROM room_users 
  GROUP BY room_id
) total_users ON r.id = total_users.room_id
ORDER BY r.created_at DESC;

-- 6. Política RLS para la nueva vista
ALTER VIEW rooms_with_user_count OWNER TO postgres;

-- Habilitar RLS en rooms si no está habilitado
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- 7. Función de utilidad para obtener salas populares
CREATE OR REPLACE FUNCTION get_popular_rooms(limit_count integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  nombre text,
  juego text,
  regiones text[],
  idiomas text[],
  paises text[],
  sistemas text[],
  min_jugadores integer,
  max_jugadores integer,
  creador_id uuid,
  created_at timestamp with time zone,
  active_users_count bigint,
  room_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rwu.id,
    rwu.nombre,
    rwu.juego,
    rwu.regiones,
    rwu.idiomas,
    rwu.paises,
    rwu.sistemas,
    rwu.min_jugadores,
    rwu.max_jugadores,
    rwu.creador_id,
    rwu.created_at,
    rwu.active_users_count,
    rwu.room_status
  FROM rooms_with_user_count rwu
  WHERE rwu.room_status != 'EMPTY'
  ORDER BY rwu.active_users_count DESC, rwu.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grants para las funciones
GRANT EXECUTE ON FUNCTION cleanup_empty_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION scheduled_room_cleanup() TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_rooms(integer) TO authenticated;
GRANT SELECT ON rooms_with_user_count TO authenticated;

-- 9. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_room_users_active_last_seen 
ON room_users(room_id, is_active, last_seen);

CREATE INDEX IF NOT EXISTS idx_rooms_created_at 
ON rooms(created_at);

-- 10. Mensaje de confirmación
SELECT '✅ Auto-limpieza de salas configurada correctamente!' as status,
       'Las salas vacías se eliminarán automáticamente' as descripcion;
