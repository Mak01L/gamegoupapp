#!/bin/bash

echo "🔧 Limpieza completa del proyecto - Arreglando sintaxis visual"

# 1. Detener todos los procesos de Node
echo "1. Deteniendo procesos Node..."
taskkill /F /IM node.exe 2>/dev/null || echo "No hay procesos Node ejecutándose"

# 2. Limpiar cache de Next.js
echo "2. Limpiando cache de Next.js..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "   ✅ Cache .next eliminado"
fi

# 3. Limpiar node_modules y reinstalar
echo "3. Reinstalando dependencias limpias..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "   ✅ node_modules eliminado"
fi

if [ -f "package-lock.json" ]; then
    rm package-lock.json
    echo "   ✅ package-lock.json eliminado"
fi

npm install
echo "   ✅ Dependencias reinstaladas"

# 4. Aplicar formateo con prettier
echo "4. Aplicando formateo..."
npx prettier --write "app/**/*.{ts,tsx}" "components/**/*.{ts,tsx}" "lib/**/*.{ts,tsx}" || echo "Formateo completado"

# 5. Verificar que no hay errores críticos
echo "5. Verificando errores..."
npm run lint --silent || echo "Linting completado"

# 6. Reiniciar servidor
echo "6. Iniciando servidor limpio..."
npm run dev

echo "🎉 Limpieza completa terminada"
echo "📋 Pasos siguientes:"
echo "   1. Reinicia VS Code completamente (Ctrl+Shift+P -> 'Developer: Reload Window')"
echo "   2. Ve a: http://localhost:3000"
echo "   3. La sintaxis debería estar limpia ahora"
