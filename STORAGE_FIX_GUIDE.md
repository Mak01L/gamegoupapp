# 🛠️ Guía para Solucionar el Problema de Storage RLS

## 📋 Resumen del Problema

La aplicación está experimentando errores HTTP 403 con el mensaje "new row violates row-level security policy" cuando intenta subir avatars al bucket `avatars` de Supabase Storage. Esto indica que las políticas de Row-Level Security (RLS) están bloqueando las operaciones de Storage.

## 🔧 Soluciones Paso a Paso

### Opción 1: Configuración Completa (Recomendada)

1. **Ir al Dashboard de Supabase**

   - Abre tu proyecto en https://supabase.com/dashboard
   - Ve a "SQL Editor"

2. **Ejecutar Script de Diagnóstico**

   - Copia y pega el contenido del archivo `supabase-storage-diagnostics.sql`
   - Ejecuta el script para ver el estado actual
   - Revisa los resultados para entender qué está configurado

3. **Ejecutar Script de Configuración**
   - Copia y pega el contenido del archivo `supabase-storage-setup.sql`
   - Ejecuta el script para crear el bucket y las políticas
   - Verifica que no haya errores en la ejecución

### Opción 2: Configuración Simplificada (Si la Opción 1 falla)

1. **Ejecutar Script Simplificado**
   - Copia y pega el contenido del archivo `supabase-storage-simple.sql`
   - Este script usa políticas más permisivas
   - Ejecuta y verifica los resultados

### Opción 3: Configuración Manual desde el Dashboard

1. **Crear Bucket Manualmente**

   - Ve a "Storage" en el dashboard de Supabase
   - Clic en "Create bucket"
   - Nombre: `avatars`
   - Configurar como público: ✅
   - Límite de tamaño: 5MB
   - Tipos MIME permitidos: `image/jpeg, image/png, image/webp, image/gif`

2. **Configurar Políticas RLS**

   - Ve a "Authentication" > "Policies"
   - Busca la tabla `storage.objects`
   - Crear las siguientes políticas:

   **Política de Lectura:**

   ```sql
   CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
   FOR SELECT USING (bucket_id = 'avatars');
   ```

   **Política de Escritura:**

   ```sql
   CREATE POLICY "Users can upload their own avatar" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'avatars'
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   **Política de Actualización:**

   ```sql
   CREATE POLICY "Users can update their own avatar" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'avatars'
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   **Política de Eliminación:**

   ```sql
   CREATE POLICY "Users can delete their own avatar" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'avatars'
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

## 🧪 Pruebas

### Prueba desde el Navegador

1. **Abrir la aplicación** en http://localhost:3000
2. **Ir al perfil** y presionar F12 para abrir Developer Tools
3. **Copiar y pegar** el código del archivo `browser-storage-test.js` en la consola
4. **Ejecutar** y revisar los resultados

### Prueba desde la Aplicación

1. **Ir al perfil** del usuario
2. **Presionar "Test Storage"** para ejecutar pruebas automáticas
3. **Revisar los mensajes** de éxito o error
4. **Intentar subir un avatar** usando el botón de la cámara

## 🐛 Debug y Troubleshooting

### Verificar Logs Detallados

La aplicación ahora incluye logs detallados que te ayudarán a identificar exactamente dónde falla:

- ✅ **Autenticación verificada:** El usuario está correctamente autenticado
- 📁 **Archivo seleccionado:** Información del archivo a subir
- 📤 **Iniciando subida:** Parámetros de la subida
- ❌ **Error detallado:** Información completa del error si falla

### Problemas Comunes y Soluciones

#### Error: "Bucket doesn't exist"

- **Solución:** Ejecutar el script de setup para crear el bucket

#### Error: "Insufficient permissions"

- **Solución:** Verificar que las políticas RLS estén correctamente configuradas

#### Error: "File too large"

- **Solución:** Verificar que el archivo sea menor a 2MB (límite de la app) y 5MB (límite del bucket)

#### Error: "Invalid file type"

- **Solución:** Solo se permiten imágenes (jpeg, png, webp, gif)

### Comandos SQL Útiles para Debug

```sql
-- Ver configuración del bucket
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Ver políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Ver archivos en el bucket
SELECT * FROM storage.objects WHERE bucket_id = 'avatars' LIMIT 10;

-- Verificar autenticación actual
SELECT current_user, session_user, current_setting('role') as current_role;
```

## 📝 Estructura de Archivos Actualizada

El código ahora usa la estructura de carpetas `{user_id}/avatar.{ext}` que es compatible con las políticas RLS que verifican que el primer elemento del path sea el ID del usuario autenticado.

**Antes:** `{user_id}.{ext}`
**Ahora:** `{user_id}/avatar.{ext}`

## ✅ Verificación Final

Una vez implementada la solución:

1. **Las políticas deben estar activas** en storage.objects
2. **El bucket `avatars` debe existir** y ser público
3. **Los usuarios autenticados deben poder subir** archivos a sus carpetas
4. **Las URLs públicas deben generarse** correctamente
5. **Los avatars deben mostrarse** en la interfaz

## 🆘 Si Nada Funciona

Si después de probar todas las opciones el problema persiste:

1. **Revisar los logs del servidor** de Supabase en el dashboard
2. **Verificar las variables de entorno** (URL y clave anónima)
3. **Comprobar que el proyecto de Supabase** esté activo y correctamente configurado
4. **Considerar crear un nuevo bucket** con un nombre diferente
5. **Contactar el soporte de Supabase** si el problema persiste

---

**Fecha de actualización:** Junio 2025
**Versión:** 2.0 - Con debugging mejorado y múltiples opciones de solución
