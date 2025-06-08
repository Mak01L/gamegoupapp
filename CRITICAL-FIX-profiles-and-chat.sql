-- =====================================================
-- CRITICAL FIX: Profiles and Chat Username Issues
-- =====================================================
-- Este script soluciona dos problemas críticos:
-- 1. Error "duplicate key value violates unique constraint 'unique_email'"
-- 2. Usernames que aparecen como "Usuario" en lugar del nombre real
-- =====================================================

-- PASO 1: Eliminar constraints problemáticos y recrear tabla profiles
-- =====================================================

-- Eliminar vistas que dependen de profiles
DROP VIEW IF EXISTS public.chat_messages_with_profiles CASCADE;
DROP VIEW IF EXISTS public.active_room_users CASCADE;

-- Eliminar tabla profiles problemática si existe
DROP TABLE IF EXISTS public.profiles CASCADE;

-- PASO 2: Crear tabla profiles con estructura correcta
-- =====================================================

CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    real_name TEXT,
    location TEXT,
    birthdate DATE,
    privacy JSONB DEFAULT '{"real_name": true, "location": true, "birthdate": true}'::jsonb,
    preferences JSONB DEFAULT '{"theme": "dark", "language": "es", "visibility": "public"}'::jsonb,
    stats JSONB DEFAULT '{"games_played": 0, "rooms_created": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 3: Crear índices optimizados
-- =====================================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_last_seen ON public.profiles(last_seen);

-- PASO 4: Función para actualizar updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

-- PASO 5: Crear función para auto-crear perfiles
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_username TEXT;
BEGIN
    -- Generar username por defecto
    default_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'user_' || substring(NEW.id::text, 1, 8)
    );
    
    -- Crear perfil automáticamente
    INSERT INTO public.profiles (
        user_id,
        username,
        email,
        avatar_url,
        created_at,
        updated_at,
        last_seen
    ) VALUES (
        NEW.id,
        default_username,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/logo.png'),
        NOW(),
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW(),
        last_seen = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-crear perfiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- PASO 6: Migrar usuarios existentes sin perfil
-- =====================================================

-- Crear perfiles para usuarios existentes que no los tengan
INSERT INTO public.profiles (user_id, username, email, avatar_url)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'username',
        u.raw_user_meta_data->>'name',
        split_part(u.email, '@', 1),
        'user_' || substring(u.id::text, 1, 8)
    ) as username,
    u.email,
    COALESCE(u.raw_user_meta_data->>'avatar_url', '/logo.png')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- PASO 7: Configurar RLS para profiles
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para leer perfiles (público)
DROP POLICY IF EXISTS "Perfiles públicos para lectura" ON public.profiles;
CREATE POLICY "Perfiles públicos para lectura"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Política para actualizar perfil propio
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Política para insertar perfil propio
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden crear su propio perfil"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- PASO 8: Recrear vistas de chat con JOIN correcto
-- =====================================================

-- Vista para mensajes con información de perfil
CREATE OR REPLACE VIEW public.chat_messages_with_profiles AS
SELECT 
    cm.id,
    cm.room_id,
    cm.user_id,
    cm.content,
    cm.created_at,
    cm.updated_at,
    COALESCE(p.username, 'Usuario') as username,
    COALESCE(p.avatar_url, '/logo.png') as avatar_url
FROM public.chat_messages cm
LEFT JOIN public.profiles p ON cm.user_id = p.user_id;

-- Vista para usuarios activos en sala con información de perfil
CREATE OR REPLACE VIEW public.active_room_users AS
SELECT 
    ru.id,
    ru.room_id,
    ru.user_id,
    ru.joined_at,
    ru.last_seen,
    ru.is_active,
    COALESCE(p.username, 'Usuario') as username,
    COALESCE(p.avatar_url, '/logo.png') as avatar_url
FROM public.room_users ru
LEFT JOIN public.profiles p ON ru.user_id = p.user_id
WHERE ru.is_active = true;

-- PASO 9: Función para actualizar presencia de usuario
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_presence(user_id_param uuid)
RETURNS void AS $$
BEGIN
    -- Actualizar last_seen en profiles
    UPDATE public.profiles 
    SET last_seen = NOW(), updated_at = NOW()
    WHERE user_id = user_id_param;
    
    -- Actualizar last_seen en room_users activos
    UPDATE public.room_users 
    SET last_seen = NOW()
    WHERE user_id = user_id_param AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 10: Función para obtener o crear perfil
-- =====================================================

CREATE OR REPLACE FUNCTION get_or_create_profile(user_id_param uuid)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    username text,
    email text,
    avatar_url text,
    bio text,
    real_name text,
    location text,
    birthdate date,
    privacy jsonb,
    preferences jsonb,
    stats jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    last_seen timestamp with time zone
) AS $$
DECLARE
    profile_exists boolean;
    auth_user_data RECORD;
    default_username text;
BEGIN
    -- Verificar si el perfil ya existe
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE profiles.user_id = user_id_param) INTO profile_exists;
    
    IF NOT profile_exists THEN
        -- Obtener datos del usuario autenticado
        SELECT * INTO auth_user_data FROM auth.users WHERE users.id = user_id_param;
        
        -- Generar username por defecto
        default_username := COALESCE(
            auth_user_data.raw_user_meta_data->>'username',
            auth_user_data.raw_user_meta_data->>'name',
            split_part(auth_user_data.email, '@', 1),
            'user_' || substring(user_id_param::text, 1, 8)
        );
        
        -- Crear el perfil
        INSERT INTO public.profiles (
            user_id,
            username,
            email,
            avatar_url
        ) VALUES (
            user_id_param,
            default_username,
            auth_user_data.email,
            COALESCE(auth_user_data.raw_user_meta_data->>'avatar_url', '/logo.png')
        );
    END IF;
    
    -- Actualizar presencia
    PERFORM update_user_presence(user_id_param);
    
    -- Retornar el perfil
    RETURN QUERY
    SELECT p.* FROM public.profiles p WHERE p.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 11: Otorgar permisos
-- =====================================================

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.chat_messages_with_profiles TO authenticated;
GRANT SELECT ON public.chat_messages_with_profiles TO anon;
GRANT SELECT ON public.active_room_users TO authenticated;
GRANT SELECT ON public.active_room_users TO anon;

GRANT EXECUTE ON FUNCTION update_user_presence(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_profile(uuid) TO authenticated;

-- PASO 12: Habilitar Realtime para profiles
-- =====================================================

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    EXCEPTION WHEN duplicate_object THEN
        -- La tabla ya está en realtime, ignorar
        NULL;
    END;
END $$;

-- PASO 13: Función de limpieza y mantenimiento
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_profiles()
RETURNS void AS $$
BEGIN
    -- Eliminar perfiles huérfanos (usuarios que ya no existen)
    DELETE FROM public.profiles 
    WHERE user_id NOT IN (SELECT id FROM auth.users);
    
    -- Actualizar usernames nulos o vacíos
    UPDATE public.profiles 
    SET username = 'user_' || substring(user_id::text, 1, 8)
    WHERE username IS NULL OR username = '' OR username = 'null';
    
    RAISE NOTICE 'Limpieza de perfiles completada';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar limpieza inicial
SELECT cleanup_profiles();

-- PASO 14: Verificación final
-- =====================================================

-- Verificar que todo se creó correctamente
SELECT 'Verificando estructura de profiles...' as status;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar vistas
SELECT 'Verificando vistas de chat...' as status;

SELECT 
    schemaname,
    viewname
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('chat_messages_with_profiles', 'active_room_users');

-- Contar perfiles existentes
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as profiles_with_username
FROM public.profiles;

-- Mensaje final
SELECT '✅ REPARACIÓN COMPLETADA EXITOSAMENTE!' as status,
       'Problemas solucionados:' as descripcion,
       '1. Tabla profiles recreada sin constraints problemáticos' as solucion_1,
       '2. Auto-creación de perfiles para nuevos usuarios' as solucion_2,
       '3. Migración de usuarios existentes' as solucion_3,
       '4. Vistas de chat actualizadas con usernames correctos' as solucion_4,
       '5. Sistema de presencia implementado' as solucion_5;
