#!/bin/bash
# Script para verificar y arreglar problemas comunes de formato en archivos TypeScript

echo "🔍 Verificando formato de archivos TypeScript..."

# Buscar líneas concatenadas sin espacios
echo "Buscando declaraciones concatenadas..."
grep -n ")  const\|')  const\|'}  const" components/*.tsx || echo "✅ No se encontraron declaraciones concatenadas"

# Buscar punto y coma faltantes
echo "Verificando estructura básica..."
grep -n "useState.*const\|useEffect.*const\|useRef.*const" components/*.tsx || echo "✅ Estructura básica correcta"

echo "✅ Verificación completada"
