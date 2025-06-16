-- Verificar funcionamiento de expulsión
-- Ejecuta esto después de expulsar un usuario

-- 1. Ver todos los usuarios en la sala (activos e inactivos)
SELECT 
    room_id,
    user_id,
    is_active,
    last_seen,
    CASE 
        WHEN is_active = true THEN '✅ ACTIVO' 
        ELSE '❌ EXPULSADO' 
    END as estado
FROM room_users 
WHERE room_id = 'test-room-001'  -- Cambia por tu room_id
ORDER BY is_active DESC, last_seen DESC;

-- 2. Contar usuarios activos vs expulsados
SELECT 
    is_active,
    COUNT(*) as cantidad,
    CASE 
        WHEN is_active = true THEN '✅ Usuarios Activos' 
        ELSE '❌ Usuarios Expulsados' 
    END as estado
FROM room_users 
WHERE room_id = 'test-room-001'  -- Cambia por tu room_id
GROUP BY is_active;

-- 3. Ver usuarios que deberían aparecer en la aplicación (solo activos)
SELECT 
    user_id,
    joined_at,
    last_seen,
    '✅ Visible en app' as estado
FROM room_users 
WHERE room_id = 'test-room-001'  -- Cambia por tu room_id
  AND is_active = true
ORDER BY joined_at;

-- 4. Verificar mensajes de expulsión en el chat
SELECT 
    user_id,
    content,
    created_at,
    '🚫 Mensaje de expulsión' as tipo
FROM chat_messages 
WHERE room_id = 'test-room-001'  -- Cambia por tu room_id
  AND content LIKE '%expulsado%'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Si quieres "rehabilitar" un usuario expulsado para seguir probando:
-- UPDATE room_users 
-- SET is_active = true, last_seen = NOW() 
-- WHERE room_id = 'test-room-001' AND user_id = 'user-001';
