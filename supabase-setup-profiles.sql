-- Script para configurar perfiles de usuario y mostrar nombres correctamente
-- Ejecuta esto en Supabase SQL Editor

-- 1. Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para que todos puedan leer perfiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- 4. Crear política para que usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. Crear política para insertar perfiles
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Insertar perfiles de prueba para los usuarios de test
INSERT INTO profiles (id, username, avatar_url) VALUES 
('creator-user', 'Creador Principal', 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=CR'),
('user-001', 'Jugador Alpha', 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=JA'),
('user-002', 'Gamer Beta', 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=GB'),
('user-003', 'Pro Player', 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=PP'),
('test-user-1', 'TestUser1', 'https://via.placeholder.com/150/FFEAA7/000000?text=T1'),
('test-user-2', 'TestUser2', 'https://via.placeholder.com/150/DDA0DD/000000?text=T2'),
('test-user-3', 'TestUser3', 'https://via.placeholder.com/150/98D8C8/000000?text=T3'),
('test-user-4', 'TestUser4', 'https://via.placeholder.com/150/F7DC6F/000000?text=T4'),
('example-user-1', 'Usuario Ejemplo 1', 'https://via.placeholder.com/150/BB8FCE/FFFFFF?text=U1'),
('example-user-2', 'Usuario Ejemplo 2', 'https://via.placeholder.com/150/85C1E9/FFFFFF?text=U2')
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

-- 7. Verificar que los perfiles se crearon correctamente
SELECT 
    p.id,
    p.username,
    p.avatar_url,
    'Perfil creado' as estado
FROM profiles p
ORDER BY p.username;

-- 8. Verificar usuarios en salas con sus perfiles
SELECT 
    ru.room_id,
    r.nombre as sala,
    ru.user_id,
    p.username,
    ru.is_active,
    CASE WHEN ru.user_id = r.creador_id THEN '👑 CREADOR' ELSE '👤 USUARIO' END as rol
FROM room_users ru
JOIN rooms r ON ru.room_id = r.id
LEFT JOIN profiles p ON ru.user_id = p.id
WHERE ru.is_active = true
ORDER BY ru.room_id, rol DESC;

-- 9. Función trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Crear trigger que se ejecuta cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
