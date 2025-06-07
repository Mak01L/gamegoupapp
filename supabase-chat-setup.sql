-- Setup completo para chat en tiempo real

-- 1. Crear tabla de mensajes de chat (si no existe)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de usuarios en sala (para tracking de usuarios activos)
CREATE TABLE IF NOT EXISTS public.room_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(room_id, user_id)
);

-- 3. Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_room_users_room_id ON public.room_users(room_id);
CREATE INDEX IF NOT EXISTS idx_room_users_active ON public.room_users(room_id, is_active);

-- 4. Trigger para actualizar updated_at en mensajes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS Policies para chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Política para leer mensajes (solo usuarios autenticados pueden ver mensajes de salas)
CREATE POLICY "Usuarios pueden leer mensajes de chat"
ON public.chat_messages FOR SELECT
TO authenticated
USING (true);

-- Política para insertar mensajes (usuarios autenticados pueden enviar mensajes)
CREATE POLICY "Usuarios pueden enviar mensajes"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para actualizar mensajes (solo el autor puede editar sus mensajes)
CREATE POLICY "Usuarios pueden editar sus mensajes"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Política para borrar mensajes (solo el autor puede borrar sus mensajes)
CREATE POLICY "Usuarios pueden borrar sus mensajes"
ON public.chat_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. RLS Policies para room_users
ALTER TABLE public.room_users ENABLE ROW LEVEL SECURITY;

-- Política para leer usuarios en sala
CREATE POLICY "Ver usuarios en sala"
ON public.room_users FOR SELECT
TO authenticated
USING (true);

-- Política para unirse a sala
CREATE POLICY "Unirse a sala"
ON public.room_users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para actualizar presencia
CREATE POLICY "Actualizar presencia"
ON public.room_users FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Política para salir de sala
CREATE POLICY "Salir de sala"
ON public.room_users FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Función para limpiar usuarios inactivos (opcional)
CREATE OR REPLACE FUNCTION cleanup_inactive_users()
RETURNS void AS $$
BEGIN
    UPDATE public.room_users 
    SET is_active = false 
    WHERE last_seen < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- 8. Crear vista para mensajes con información de usuario
CREATE OR REPLACE VIEW public.chat_messages_with_profiles AS
SELECT 
    cm.*,
    p.username,
    p.avatar_url
FROM public.chat_messages cm
LEFT JOIN public.profiles p ON cm.user_id = p.user_id;

-- 9. Crear vista para usuarios activos en sala
CREATE OR REPLACE VIEW public.active_room_users AS
SELECT 
    ru.*,
    p.username,
    p.avatar_url
FROM public.room_users ru
LEFT JOIN public.profiles p ON ru.user_id = p.user_id
WHERE ru.is_active = true;

-- 10. Habilitar Realtime para las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_users;
