-- Script para probar la funcionalidad de expulsión
-- Ejecuta esto en el Editor SQL de Supabase después de agregar las salas

-- 1. Primero verifica que existan las salas
SELECT id, nombre, creador_id FROM rooms;

-- 2. Agregar usuarios de prueba a las salas (simular usuarios conectados)
INSERT INTO room_users (room_id, user_id, is_active, joined_at, last_seen) VALUES 
-- Usuarios en la sala Crimson Shield
('550e8400-e29b-41d4-a716-446655440001', 'test-user-1', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'test-user-2', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'example-user-1', true, NOW(), NOW()), -- Este es el creador

-- Usuarios en la sala Minecraft Builders
('550e8400-e29b-41d4-a716-446655440002', 'test-user-3', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'test-user-4', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'example-user-2', true, NOW(), NOW()) -- Este es el creador
ON CONFLICT (room_id, user_id) DO NOTHING;

-- 3. Verificar que se agregaron correctamente
SELECT 
  ru.room_id, 
  r.nombre as sala_nombre,
  ru.user_id, 
  ru.is_active,
  CASE WHEN ru.user_id = r.creador_id THEN 'CREADOR' ELSE 'USUARIO' END as rol
FROM room_users ru
JOIN rooms r ON ru.room_id = r.id
WHERE ru.is_active = true
ORDER BY ru.room_id, rol DESC;

-- 4. Opcional: Agregar algunos mensajes de prueba
INSERT INTO chat_messages (room_id, user_id, content, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'test-user-1', 'Hola a todos!', NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'test-user-2', 'Listos para jugar?', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'test-user-3', 'Empezamos a construir!', NOW());
