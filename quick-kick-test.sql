-- Script SIMPLE para pruebas de expulsión
-- Ejecuta esto paso a paso en Supabase SQL Editor

-- 1. Verificar que existan las salas
SELECT id, nombre, creador_id FROM rooms;

-- 2. Si no hay salas, crear una de prueba:
INSERT INTO rooms (id, nombre, juego, regiones, idiomas, paises, sistemas, min_jugadores, max_jugadores, creador_id, created_at) 
VALUES ('test-room-001', 'Sala de Prueba', 'Counter-Strike', ARRAY['América'], ARRAY['Español'], ARRAY['Argentina'], ARRAY['PC'], 2, 10, 'creator-user', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Agregar usuarios de prueba a la sala
INSERT INTO room_users (room_id, user_id, is_active, joined_at, last_seen) VALUES 
('test-room-001', 'creator-user', true, NOW(), NOW()),     -- Este es el CREADOR
('test-room-001', 'user-001', true, NOW(), NOW()),        -- Usuario normal 1
('test-room-001', 'user-002', true, NOW(), NOW()),        -- Usuario normal 2
('test-room-001', 'user-003', true, NOW(), NOW())         -- Usuario normal 3
ON CONFLICT (room_id, user_id) DO UPDATE SET 
    is_active = true, 
    last_seen = NOW();

-- 4. Verificar usuarios en la sala
SELECT 
    ru.room_id,
    r.nombre as sala,
    ru.user_id,
    ru.is_active,
    CASE WHEN ru.user_id = r.creador_id THEN '👑 CREADOR' ELSE '👤 USUARIO' END as rol
FROM room_users ru
JOIN rooms r ON ru.room_id = r.id
WHERE ru.room_id = 'test-room-001' AND ru.is_active = true
ORDER BY rol DESC;

-- 5. Opcional: Agregar algunos mensajes
INSERT INTO chat_messages (room_id, user_id, content, created_at) VALUES 
('test-room-001', 'user-001', 'Hola! Soy user-001', NOW()),
('test-room-001', 'user-002', 'Hola! Soy user-002', NOW()),
('test-room-001', 'creator-user', 'Hola a todos, soy el creador', NOW());

-- INSTRUCCIONES PARA PROBAR:
-- 1. Ejecuta todo este script
-- 2. Ve a la aplicación en: http://localhost:3000/room/test-room-001  
-- 3. Autentícate como 'creator-user' (o configura tu user ID como creador)
-- 4. Deberías ver los botones "🚫 Expulsar" en los otros usuarios
