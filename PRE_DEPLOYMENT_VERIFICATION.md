# 🔧 Script de Verificación de Despliegue

## Ejecuta este script antes del despliegue

```bash
#!/bin/bash

echo "🚀 Verificando GameGoUp para despliegue..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json. Ejecuta desde la raíz del proyecto."
    exit 1
fi

echo "✅ Directorio correcto encontrado"

# Verificar Node.js y npm
node_version=$(node --version)
npm_version=$(npm --version)

echo "📦 Node.js version: $node_version"
echo "📦 npm version: $npm_version"

# Instalar dependencias
echo "📥 Instalando dependencias..."
npm install

# Verificar build
echo "🔨 Verificando build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build"
    exit 1
fi

# Verificar archivos importantes
echo "📁 Verificando archivos importantes..."

required_files=(
    "components/DonationWidget.tsx"
    "components/AdManager.tsx"
    "components/CommunityHub.tsx"
    "lib/adConfig.ts"
    "public/locales/en/common.json"
    "public/locales/es/common.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file no encontrado"
    fi
done

echo "🎉 Verificación completada. Tu app está lista para despliegue!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Subir código a GitHub"
echo "2. Conectar con Vercel"
echo "3. Configurar variables de entorno"
echo "4. Conectar tu dominio"
```

## Variables de Entorno Necesarias

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui

# Google AdSense (opcional, para después de la verificación)
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-7274762890410296
```

## Checklist Final

### ✅ Antes del Despliegue:

- [ ] `npm run build` funciona sin errores
- [ ] Todos los componentes de donación funcionan
- [ ] Enlaces de Discord y Twitter funcionan
- [ ] Variables de entorno configuradas
- [ ] Archivos de traducción completos

### ✅ Durante el Despliegue:

- [ ] Repositorio Git creado
- [ ] Código subido a GitHub
- [ ] Proyecto conectado a Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Build automático exitoso

### ✅ Después del Despliegue:

- [ ] Dominio conectado y funcionando
- [ ] SSL activo (HTTPS)
- [ ] Supabase URLs actualizadas
- [ ] Donaciones PayPal funcionan
- [ ] Enlaces sociales funcionan
- [ ] Google AdSense en proceso de verificación
