-- Script SIMPLE para agregar usuarios con nombres reales
-- Ejecuta esto paso a paso en Supabase SQL Editor

-- 1. Crear tabla profiles si no existe (versión simple)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Insertar perfiles de usuarios de prueba
INSERT INTO profiles (id, username, avatar_url) VALUES 
('creator-user', 'Creador Principal', 'https://i.imgur.com/1.png'),
('user-001', 'Jugador Alpha', 'https://i.imgur.com/2.png'),
('user-002', 'Gamer Beta', 'https://i.imgur.com/3.png'),
('user-003', 'Pro Player', 'https://i.imgur.com/4.png'),
('example-user-1', 'Usuario Ejemplo 1', 'https://i.imgur.com/5.png'),
('example-user-2', 'Usuario Ejemplo 2', 'https://i.imgur.com/6.png')
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url;

-- 3. Verificar que los perfiles se crearon
SELECT * FROM profiles ORDER BY username;

-- 4. Verificar usuarios en salas
SELECT 
    ru.room_id,
    ru.user_id,
    p.username,
    p.avatar_url,
    ru.is_active
FROM room_users ru
LEFT JOIN profiles p ON ru.user_id = p.id
WHERE ru.is_active = true
ORDER BY ru.room_id;

-- 5. Si quieres agregar más usuarios:
/*
INSERT INTO profiles (id, username, avatar_url) VALUES 
('nuevo-user-1', 'Nuevo Jugador 1', 'https://i.imgur.com/7.png'),
('nuevo-user-2', 'Nuevo Jugador 2', 'https://i.imgur.com/8.png');
*/
