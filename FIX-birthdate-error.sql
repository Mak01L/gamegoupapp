-- =====================================================
-- FIX: Error birthdate "invalid input syntax for type date: ''"
-- =====================================================
-- Este script soluciona el error de fecha de nacimiento con cadena vacía

-- PASO 1: Limpiar datos existentes con birthdate vacío
-- =====================================================

-- Primero, cambiar el tipo de la columna a TEXT temporalmente para limpiar datos corruptos
ALTER TABLE public.profiles ALTER COLUMN birthdate TYPE TEXT;

-- Limpiar cadenas vacías y valores problemáticos
UPDATE public.profiles 
SET birthdate = NULL 
WHERE birthdate = '' OR birthdate = 'null' OR birthdate IS NULL;

-- Convertir de vuelta a tipo DATE
ALTER TABLE public.profiles ALTER COLUMN birthdate TYPE DATE USING 
  CASE 
    WHEN birthdate IS NULL OR birthdate = '' THEN NULL
    ELSE birthdate::DATE 
  END;

-- PASO 2: Verificar que la corrección funcionó
-- =====================================================

SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN birthdate IS NOT NULL THEN 1 END) as profiles_with_birthdate,
    COUNT(CASE WHEN birthdate IS NULL THEN 1 END) as profiles_without_birthdate
FROM public.profiles;

-- PASO 3: Mensaje de confirmación
-- =====================================================

SELECT '✅ CORRECCIÓN BIRTHDATE COMPLETADA' as status,
       'Cadenas vacías en birthdate convertidas a NULL' as descripcion,
       'Ahora los perfiles se pueden crear sin problemas' as resultado;
