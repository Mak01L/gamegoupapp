# 🚀 Guía Completa: Desplegar GameGoUp en tu Dominio Web

## 📋 Información Necesaria

Antes de comenzar, necesitas tener:

1. **Tu dominio web** (ej: `tugamegoUp.com`)
2. **Proveedor de hosting** (ej: Hostinger, GoDaddy, Namecheap, etc.)
3. **Acceso al panel de control de tu hosting**
4. **Cuenta de Supabase** (ya configurada)

---

## 🎯 Opciones de Despliegue Recomendadas

### **OPCIÓN 1: Vercel (Recomendado) - GRATIS**
✅ **Ideal para Next.js**
✅ **Gratuito**  
✅ **Fácil configuración**
✅ **SSL automático**

### **OPCIÓN 2: Netlify (Alternativa) - GRATIS**
✅ **Buena para sitios estáticos**
✅ **Gratuito**

### **OPCIÓN 3: Tu Hosting Web Actual**
⚠️ **Requiere configuración de Node.js**
⚠️ **Puede ser más complejo**

---

## 🚀 MÉTODO 1: Despliegue con Vercel (RECOMENDADO)

### Paso 1: Preparar el Proyecto
```bash
# En tu terminal, dentro de la carpeta del proyecto
cd d:\gamer-chat-app

# Instalar dependencias
npm install

# Verificar que todo funciona
npm run build
```

### Paso 2: Subir a GitHub
```bash
# Inicializar repositorio Git (si no lo has hecho)
git init
git add .
git commit -m "Initial commit - GameGoUp ready for deployment"

# Crear repositorio en GitHub y subirlo
# Ve a github.com, crea un nuevo repositorio llamado "gamegoUp-app"
git remote add origin https://github.com/TU_USUARIO/gamegoUp-app.git
git branch -M main
git push -u origin main
```

### Paso 3: Desplegar en Vercel
1. **Ir a [vercel.com](https://vercel.com)**
2. **Registrarse con GitHub**
3. **Hacer clic en "New Project"**
4. **Seleccionar tu repositorio "gamegoUp-app"**
5. **Configurar variables de entorno:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_de_supabase
   ```
6. **Hacer clic en "Deploy"**

### Paso 4: Conectar tu Dominio
1. **En el dashboard de Vercel, ir a "Settings" > "Domains"**
2. **Agregar tu dominio**: `tugamegoup.com`
3. **Configurar DNS en tu proveedor de hosting:**
   - Tipo: `CNAME`
   - Nombre: `@` (o vacío)
   - Valor: `cname.vercel-dns.com`

---

## 🌐 MÉTODO 2: Hosting Web Tradicional

### Requisitos del Hosting
Tu hosting debe soportar:
- ✅ **Node.js** (versión 18+)
- ✅ **npm/yarn**
- ✅ **SSL/HTTPS**

### Paso 1: Generar Build de Producción
```bash
# En tu proyecto
npm run build
npm run export  # Si tu hosting no soporta SSR
```

### Paso 2: Subir Archivos
1. **Comprimir la carpeta `out/` o `.next/`**
2. **Subir via FTP/FileManager a la carpeta `public_html/`**
3. **Configurar Node.js en el panel de control**

---

## ⚙️ Configuración de Variables de Entorno

### En Vercel/Netlify:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_anonima
```

### En Hosting Web:
Crear archivo `.env.production`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_anonima
```

---

## 🔒 Configuración de Dominio y SSL

### Para Vercel:
1. **Dominio automáticamente tiene SSL**
2. **Redirecciones automáticas HTTPS**

### Para Hosting Tradicional:
1. **Activar SSL en el panel de control**
2. **Configurar redirecciones HTTPS:**
   ```apache
   # En .htaccess
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

---

## 🎮 Configuración de Supabase para Producción

### Paso 1: Actualizar URLs Permitidas
En tu panel de Supabase:
1. **Ir a Authentication > URL Configuration**
2. **Agregar tu dominio a "Site URL":**
   ```
   https://tugamegoup.com
   ```
3. **Agregar a "Redirect URLs":**
   ```
   https://tugamegoup.com/auth/callback
   ```

### Paso 2: Configurar CORS
```sql
-- En SQL Editor de Supabase
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
```

---

## 🧪 Lista de Verificación Pre-Despliegue

### ✅ Verificaciones Técnicas:
- [ ] `npm run build` funciona sin errores
- [ ] Variables de entorno configuradas
- [ ] Supabase URLs actualizadas
- [ ] SSL activado en dominio
- [ ] DNS configurado correctamente

### ✅ Verificaciones Funcionales:
- [ ] Login/Register funciona
- [ ] Crear salas funciona
- [ ] Chat funciona (si está configurado)
- [ ] Donaciones PayPal funciona
- [ ] Enlaces Discord/Twitter funcionan

---

## 🎯 Configuración Específica por Proveedor

### **Hostinger:**
```bash
# En File Manager, subir a public_html/
# Activar SSL gratuito en panel
# Node.js disponible en planes premium
```

### **GoDaddy:**
```bash
# cPanel > File Manager > public_html/
# SSL disponible (puede tener costo)
# Node.js en planes específicos
```

### **Namecheap:**
```bash
# cPanel > File Manager > public_html/
# SSL gratuito con algunos planes
# Verificar soporte Node.js
```

---

## 🚨 Solución de Problemas Comunes

### Error: "Module not found"
```bash
# Reinstalar dependencias
npm install
npm run build
```

### Error: "Supabase connection failed"
- ✅ Verificar variables de entorno
- ✅ Verificar URLs en Supabase
- ✅ Verificar CORS

### Error: "SSL Certificate"
- ✅ Esperar 24-48 horas para propagación DNS
- ✅ Verificar configuración SSL en hosting

---

## 📞 Contacto y Soporte

Si necesitas ayuda específica con tu proveedor de hosting, puedes:
1. **Contactar soporte técnico de tu hosting**
2. **Verificar documentación de Node.js de tu proveedor**
3. **Considerar migrar a Vercel (gratis y optimizado)**

---

## 🎉 ¡Felicidades!

Una vez completado, tu GameGoUp estará disponible en:
- **https://tugamegoup.com**
- **Con SSL automático**
- **Donaciones PayPal funcionando**
- **Enlaces a Discord y Twitter**
- **Sistema de publicidad integrado**
