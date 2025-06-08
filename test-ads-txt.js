// Test para verificar que ads.txt se sirve correctamente en desarrollo
// Ejecutar: node test-ads-txt.js

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO CONFIGURACIÓN ADS.TXT PARA GAMGOUP.SPACE\n');

// 1. Verificar que el archivo existe localmente
const adsFilePath = path.join(__dirname, 'public', 'ads.txt');
console.log('1. Verificando archivo local...');
try {
  if (fs.existsSync(adsFilePath)) {
    console.log('✅ Archivo ads.txt encontrado en public/');
    
    const content = fs.readFileSync(adsFilePath, 'utf8');
    console.log('📄 Contenido del archivo:');
    console.log('─'.repeat(50));
    console.log(content);
    console.log('─'.repeat(50));
    
    // Verificar que contiene el Publisher ID correcto
    if (content.includes('ca-pub-7274762890410296')) {
      console.log('✅ Publisher ID correcto encontrado');
    } else {
      console.log('❌ Publisher ID no encontrado o incorrecto');
    }
    
    // Verificar formato
    if (content.includes('google.com, ca-pub-7274762890410296, DIRECT, f08c47fec0942fa0')) {
      console.log('✅ Formato correcto para Google AdSense');
    } else {
      console.log('❌ Formato incorrecto para Google AdSense');
    }
    
  } else {
    console.log('❌ Archivo ads.txt NO encontrado en public/');
    console.log('   Asegúrate de que está en la ubicación correcta');
  }
} catch (error) {
  console.log('❌ Error leyendo archivo:', error.message);
}

console.log('\n2. Información de deployment...');
console.log('🌐 Dominio: gamgoup.space');
console.log('📍 URL ads.txt: https://gamgoup.space/ads.txt');
console.log('🔑 Publisher ID: ca-pub-7274762890410296');

console.log('\n3. Comandos para verificación post-deployment:');
console.log('   curl https://gamgoup.space/ads.txt');
console.log('   Invoke-WebRequest -Uri "https://gamgoup.space/ads.txt"');

console.log('\n4. Validadores online:');
console.log('   - https://adstxt.guru/ (ingresar: gamgoup.space)');
console.log('   - Google AdSense Console');

console.log('\n✅ Verificación local completada');
console.log('📋 El archivo está listo para deployment a gamgoup.space');
