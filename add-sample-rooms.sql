-- Script para agregar salas de prueba
-- Ejecuta esto en el Editor SQL de Supabase

INSERT INTO rooms (
  id,
  nombre,
  juego,
  regiones,
  idiomas,
  paises,
  sistemas,
  min_jugadores,
  max_jugadores,
  creador_id,
  created_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Crimson Shield',
  'Gray Zone Warfare',
  ARRAY['Suramérica'],
  ARRAY['Español'],
  ARRAY['Uruguay'],
  ARRAY['PC'],
  2,
  10,
  'example-user-1',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Minecraft Builders',
  'Minecraft',
  ARRAY['Suramérica'],
  ARRAY['Español'],
  ARRAY['Uruguay'],
  ARRAY['PC'],
  2,
  10,
  'example-user-2',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Valorant Squad',
  'Valorant',
  ARRAY['Norteamérica', 'Suramérica'],
  ARRAY['Español', 'Inglés'],
  ARRAY['México', 'Argentina'],
  ARRAY['PC'],
  5,
  5,
  'example-user-3',
  NOW()
);

-- Verificar que se insertaron correctamente
SELECT * FROM rooms;
