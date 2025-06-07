-- Verificación rápida del setup del chat
-- Ejecuta este script para verificar si las tablas de chat existen

-- Verificar tablas principales
SELECT 'chat_messages exists' as table_check, 
       EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'chat_messages'
       ) as result

UNION ALL

SELECT 'room_users exists' as table_check,
       EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = 'room_users'
       ) as result

UNION ALL

-- Verificar columna is_active específicamente
SELECT 'is_active column exists' as table_check,
       EXISTS (
         SELECT FROM information_schema.columns 
         WHERE table_schema = 'public' 
         AND table_name = 'room_users'
         AND column_name = 'is_active'
       ) as result;

-- Si todo está OK, verás:
-- chat_messages exists | true
-- room_users exists | true  
-- is_active column exists | true
