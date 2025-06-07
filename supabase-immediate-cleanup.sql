-- Script para auto-eliminación inmediata de salas vacías
-- Este script implementa la eliminación automática cuando un usuario sale de una sala

-- 1. Función para verificar y eliminar sala si está vacía
CREATE OR REPLACE FUNCTION check_and_cleanup_empty_room(room_id_param uuid)
RETURNS boolean AS $$
DECLARE
  active_users_count integer;
  room_deleted boolean := false;
BEGIN
  -- Contar usuarios activos en la sala
  SELECT COUNT(*) INTO active_users_count
  FROM room_users 
  WHERE room_id = room_id_param 
  AND is_active = true;
  
  -- Si no hay usuarios activos, eliminar la sala
  IF active_users_count = 0 THEN
    DELETE FROM rooms WHERE id = room_id_param;
    room_deleted := true;
    RAISE NOTICE 'Sala % eliminada por estar vacía', room_id_param;
  END IF;
  
  RETURN room_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Función para que un usuario salga de la sala de forma segura
CREATE OR REPLACE FUNCTION leave_room_safely(room_id_param uuid, user_id_param uuid)
RETURNS json AS $$
DECLARE
  room_deleted boolean := false;
  result json;
BEGIN
  -- Marcar al usuario como inactivo
  UPDATE room_users 
  SET is_active = false, 
      last_seen = NOW()
  WHERE room_id = room_id_param 
  AND user_id = user_id_param;
  
  -- Verificar si la sala debe eliminarse
  SELECT check_and_cleanup_empty_room(room_id_param) INTO room_deleted;
  
  -- Retornar resultado
  result := json_build_object(
    'success', true,
    'room_deleted', room_deleted,
    'message', CASE 
      WHEN room_deleted THEN 'Usuario salió y sala eliminada'
      ELSE 'Usuario salió de la sala'
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger automático cuando un usuario se vuelve inactivo
CREATE OR REPLACE FUNCTION trigger_auto_cleanup_on_leave()
RETURNS trigger AS $$
BEGIN
  -- Solo actuar cuando un usuario se vuelve inactivo
  IF OLD.is_active = true AND NEW.is_active = false THEN
    -- Verificar y limpiar sala si es necesario
    PERFORM check_and_cleanup_empty_room(NEW.room_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear el trigger
DROP TRIGGER IF EXISTS auto_cleanup_on_user_leave ON room_users;
CREATE TRIGGER auto_cleanup_on_user_leave
  AFTER UPDATE ON room_users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_cleanup_on_leave();

-- 5. Función para limpieza programada de usuarios inactivos
CREATE OR REPLACE FUNCTION cleanup_inactive_users()
RETURNS json AS $$
DECLARE
  users_cleaned integer := 0;
  rooms_cleaned integer := 0;
  room_ids_to_check uuid[];
BEGIN
  -- Obtener IDs de salas que pueden quedar vacías
  SELECT ARRAY(
    SELECT DISTINCT room_id 
    FROM room_users 
    WHERE is_active = true 
    AND last_seen < NOW() - INTERVAL '5 minutes'
  ) INTO room_ids_to_check;
  
  -- Marcar usuarios inactivos
  UPDATE room_users 
  SET is_active = false 
  WHERE is_active = true 
  AND last_seen < NOW() - INTERVAL '5 minutes';
  
  GET DIAGNOSTICS users_cleaned = ROW_COUNT;
  
  -- Verificar cada sala que pudo haber quedado vacía
  FOR i IN 1..array_length(room_ids_to_check, 1) LOOP
    IF check_and_cleanup_empty_room(room_ids_to_check[i]) THEN
      rooms_cleaned := rooms_cleaned + 1;
    END IF;
  END LOOP;
  
  RETURN json_build_object(
    'users_cleaned', users_cleaned,
    'rooms_cleaned', rooms_cleaned,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Vista actualizada con conteo en tiempo real
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
  AND last_seen > NOW() - INTERVAL '10 minutes'
  GROUP BY room_id
) active_users ON r.id = active_users.room_id
LEFT JOIN (
  SELECT room_id, COUNT(*) as count
  FROM room_users 
  GROUP BY room_id
) total_users ON r.id = total_users.room_id
ORDER BY active_users.count DESC, r.created_at DESC;

-- 7. Grants para las funciones
GRANT EXECUTE ON FUNCTION check_and_cleanup_empty_room(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION leave_room_safely(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_inactive_users() TO authenticated;
GRANT SELECT ON rooms_with_user_count TO authenticated;

-- 8. Política RLS para la vista
ALTER VIEW rooms_with_user_count OWNER TO postgres;

-- 9. Mensaje de confirmación
SELECT '✅ Sistema de auto-eliminación inmediata configurado!' as status,
       'Las salas se eliminarán automáticamente cuando queden vacías' as descripcion;
