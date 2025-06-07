-- Verificar tablas existentes en la base de datos

-- 1. Ver todas las tablas en el esquema public
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar si las tablas de chat existen
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'chat_messages'
) as chat_messages_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'room_users'
) as room_users_exists;

-- 3. Si existen, ver la estructura
\d public.chat_messages;
\d public.room_users;
