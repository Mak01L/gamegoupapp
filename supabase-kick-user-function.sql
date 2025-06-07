-- Script para crear funciones de moderación de salas
-- Incluye funciones para expulsar usuarios y gestión de moderadores

-- 1. Función para expulsar un usuario de una sala (solo para creadores)
CREATE OR REPLACE FUNCTION kick_user_from_room(
  room_id_param uuid,
  creator_id_param uuid,
  user_to_kick_id_param uuid
)
RETURNS json AS $$
DECLARE
  result json;
  room_creator_id uuid;
BEGIN
  -- Verificar que el usuario que ejecuta la acción es el creador de la sala
  SELECT creador_id INTO room_creator_id
  FROM rooms 
  WHERE id = room_id_param;
  
  -- Validaciones
  IF room_creator_id IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'Sala no encontrada'
    );
    RETURN result;
  END IF;
  
  IF room_creator_id != creator_id_param THEN
    result := json_build_object(
      'success', false,
      'error', 'Solo el creador puede expulsar usuarios'
    );
    RETURN result;
  END IF;
  
  IF creator_id_param = user_to_kick_id_param THEN
    result := json_build_object(
      'success', false,
      'error', 'El creador no puede expulsarse a sí mismo'
    );
    RETURN result;
  END IF;
  
  -- Marcar al usuario como inactivo (expulsado)
  UPDATE room_users 
  SET is_active = false, 
      last_seen = NOW()
  WHERE room_id = room_id_param 
  AND user_id = user_to_kick_id_param;
  
  -- Verificar si se actualizó algún registro
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'error', 'Usuario no encontrado en la sala'
    );
    RETURN result;
  END IF;
  
  result := json_build_object(
    'success', true,
    'message', 'Usuario expulsado exitosamente'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Función para verificar si un usuario es el creador de una sala
CREATE OR REPLACE FUNCTION is_room_creator(
  room_id_param uuid,
  user_id_param uuid
)
RETURNS boolean AS $$
DECLARE
  room_creator_id uuid;
BEGIN
  SELECT creador_id INTO room_creator_id
  FROM rooms 
  WHERE id = room_id_param;
  
  RETURN room_creator_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Función para obtener estadísticas de la sala para el creador
CREATE OR REPLACE FUNCTION get_room_stats(
  room_id_param uuid,
  creator_id_param uuid
)
RETURNS json AS $$
DECLARE
  result json;
  active_users_count integer;
  total_messages_count integer;
  room_creator_id uuid;
BEGIN
  -- Verificar que el usuario es el creador
  SELECT creador_id INTO room_creator_id
  FROM rooms 
  WHERE id = room_id_param;
  
  IF room_creator_id != creator_id_param THEN
    result := json_build_object(
      'success', false,
      'error', 'Acceso denegado'
    );
    RETURN result;
  END IF;
  
  -- Obtener conteo de usuarios activos
  SELECT COUNT(*) INTO active_users_count
  FROM room_users 
  WHERE room_id = room_id_param 
  AND is_active = true;
  
  -- Obtener conteo de mensajes
  SELECT COUNT(*) INTO total_messages_count
  FROM chat_messages 
  WHERE room_id = room_id_param;
  
  result := json_build_object(
    'success', true,
    'active_users', active_users_count,
    'total_messages', total_messages_count,
    'created_at', (SELECT created_at FROM rooms WHERE id = room_id_param)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Otorgar permisos para ejecutar las funciones
GRANT EXECUTE ON FUNCTION kick_user_from_room(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_room_creator(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_room_stats(uuid, uuid) TO authenticated;
