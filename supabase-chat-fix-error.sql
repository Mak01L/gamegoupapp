-- Script para reparar el error "column is_active does not exist"

-- 1. Eliminar vistas que dependen de las tablas
DROP VIEW IF EXISTS public.active_room_users CASCADE;
DROP VIEW IF EXISTS public.chat_messages_with_profiles CASCADE;

-- 2. Eliminar tablas problemáticas para recrearlas
DROP TABLE IF EXISTS public.room_users CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;

-- 3. Recrear tabla de mensajes de chat
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Recrear tabla de usuarios en sala con la columna is_active
CREATE TABLE public.room_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true NOT NULL,
    UNIQUE(room_id, user_id)
);

-- 5. Crear índices
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_room_users_room_id ON public.room_users(room_id);
CREATE INDEX idx_room_users_active ON public.room_users(room_id, is_active);

-- 6. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Habilitar RLS en ambas tablas
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_users ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies para chat_messages
DROP POLICY IF EXISTS "Usuarios pueden leer mensajes de chat" ON public.chat_messages;
CREATE POLICY "Usuarios pueden leer mensajes de chat"
ON public.chat_messages FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuarios pueden enviar mensajes" ON public.chat_messages;
CREATE POLICY "Usuarios pueden enviar mensajes"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden editar sus mensajes" ON public.chat_messages;
CREATE POLICY "Usuarios pueden editar sus mensajes"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden borrar sus mensajes" ON public.chat_messages;
CREATE POLICY "Usuarios pueden borrar sus mensajes"
ON public.chat_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 10. RLS Policies para room_users
DROP POLICY IF EXISTS "Ver usuarios en sala" ON public.room_users;
CREATE POLICY "Ver usuarios en sala"
ON public.room_users FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Unirse a sala" ON public.room_users;
CREATE POLICY "Unirse a sala"
ON public.room_users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Actualizar presencia" ON public.room_users;
CREATE POLICY "Actualizar presencia"
ON public.room_users FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Salir de sala" ON public.room_users;
CREATE POLICY "Salir de sala"
ON public.room_users FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 11. Recrear vistas
CREATE VIEW public.chat_messages_with_profiles AS
SELECT 
    cm.*,
    p.username,
    p.avatar_url
FROM public.chat_messages cm
LEFT JOIN public.profiles p ON cm.user_id = p.user_id;

CREATE VIEW public.active_room_users AS
SELECT 
    ru.*,
    p.username,
    p.avatar_url
FROM public.room_users ru
LEFT JOIN public.profiles p ON ru.user_id = p.user_id
WHERE ru.is_active = true;

-- 12. Función para limpiar usuarios inactivos
CREATE OR REPLACE FUNCTION cleanup_inactive_users()
RETURNS void AS $$
BEGIN
    UPDATE public.room_users 
    SET is_active = false 
    WHERE last_seen < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- 13. Habilitar Realtime
DO $$
BEGIN
    -- Agregar tablas a realtime si no están ya agregadas
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    EXCEPTION WHEN duplicate_object THEN
        -- La tabla ya está en realtime, ignorar
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.room_users;
    EXCEPTION WHEN duplicate_object THEN
        -- La tabla ya está en realtime, ignorar
        NULL;
    END;
END $$;

-- 14. Verificar que todo se creó correctamente
SELECT 'Verificando tablas creadas...' as status;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('chat_messages', 'room_users')
ORDER BY table_name, ordinal_position;

SELECT 'Setup completado exitosamente!' as result;
