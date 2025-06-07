-- Verificar que las salas se están creando correctamente

-- 1. Ver todas las salas creadas
SELECT 
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
FROM public.rooms 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Contar total de salas
SELECT COUNT(*) as total_salas FROM public.rooms;

-- 3. Ver salas por usuario (si hay)
SELECT 
  creador_id,
  COUNT(*) as salas_creadas,
  MAX(created_at) as ultima_sala
FROM public.rooms 
GROUP BY creador_id;
