#!/usr/bin/env node

/**
 * Script de verificación final para GameGoUp
 * Verifica que todos los componentes estén listos para despliegue
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 VERIFICACIÓN FINAL - GAMEGORUP');
console.log('================================\n');

const checks = [];

// 1. Verificar archivos principales
const criticalFiles = [
  'app/layout.tsx',
  'app/dashboard/page.tsx',
  'components/DonationWidget.tsx',
  'components/AdManager.tsx',
  'components/GoogleAdSense.tsx',
  'lib/adConfig.ts',
  '.env.local',
  'package.json'
];

console.log('📁 VERIFICANDO ARCHIVOS CRÍTICOS...');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: file, status: exists });
});

// 2. Verificar configuración AdSense
console.log('\n📊 VERIFICANDO CONFIGURACIÓN ADSENSE...');
try {
  const adConfigPath = path.join(__dirname, 'lib/adConfig.ts');
  const adConfig = fs.readFileSync(adConfigPath, 'utf8');
  
  const hasPublisherId = adConfig.includes('ca-pub-7274762890410296');
  const hasPendingSlots = adConfig.includes('PENDING_VERIFICATION');
  const hasFallbackAds = adConfig.includes('fallbackAds');
  
  console.log(`${hasPublisherId ? '✅' : '❌'} Publisher ID configurado`);
  console.log(`${hasPendingSlots ? '✅' : '❌'} Slots en estado PENDING_VERIFICATION`);
  console.log(`${hasFallbackAds ? '✅' : '❌'} Anuncios fallback configurados`);
  
  checks.push(
    { name: 'Publisher ID', status: hasPublisherId },
    { name: 'Pending Slots', status: hasPendingSlots },
    { name: 'Fallback Ads', status: hasFallbackAds }
  );
} catch (error) {
  console.log('❌ Error leyendo configuración AdSense');
  checks.push({ name: 'AdSense Config', status: false });
}

// 3. Verificar configuración PayPal
console.log('\n💰 VERIFICANDO CONFIGURACIÓN PAYPAL...');
try {
  const adConfigPath = path.join(__dirname, 'lib/adConfig.ts');
  const adConfig = fs.readFileSync(adConfigPath, 'utf8');
  
  const hasPayPalUrl = adConfig.includes('RH23HZUUGEGVN');
  console.log(`${hasPayPalUrl ? '✅' : '❌'} URL PayPal configurada`);
  
  checks.push({ name: 'PayPal URL', status: hasPayPalUrl });
} catch (error) {
  console.log('❌ Error verificando PayPal');
  checks.push({ name: 'PayPal Config', status: false });
}

// 4. Verificar variables de entorno
console.log('\n🔐 VERIFICANDO VARIABLES DE ENTORNO...');
try {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  
  console.log(`${hasSupabaseUrl ? '✅' : '❌'} SUPABASE_URL configurada`);
  console.log(`${hasSupabaseKey ? '✅' : '❌'} SUPABASE_ANON_KEY configurada`);
  
  checks.push(
    { name: 'Supabase URL', status: hasSupabaseUrl },
    { name: 'Supabase Key', status: hasSupabaseKey }
  );
} catch (error) {
  console.log('❌ Error leyendo variables de entorno');
  checks.push({ name: 'Environment Variables', status: false });
}

// 5. Verificar integración en Layout
console.log('\n🏗️ VERIFICANDO INTEGRACIÓN EN LAYOUT...');
try {
  const layoutPath = path.join(__dirname, 'app/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const hasAdSenseScript = layoutContent.includes('pagead2.googlesyndication.com');
  const hasPublisherId = layoutContent.includes('ADSENSE_CONFIG.publisherId');
  
  console.log(`${hasAdSenseScript ? '✅' : '❌'} Script AdSense en Layout`);
  console.log(`${hasPublisherId ? '✅' : '❌'} Publisher ID en Layout`);
  
  checks.push(
    { name: 'AdSense Script', status: hasAdSenseScript },
    { name: 'Publisher ID in Layout', status: hasPublisherId }
  );
} catch (error) {
  console.log('❌ Error verificando Layout');
  checks.push({ name: 'Layout Integration', status: false });
}

// 6. Verificar traducciones
console.log('\n🌐 VERIFICANDO TRADUCCIONES...');
const translations = [
  'public/locales/en/common.json',
  'public/locales/es/common.json'
];

translations.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const json = JSON.parse(content);
      const hasDonation = json.dashboard && json.dashboard.support && json.dashboard.support.donation;
    const hasAds = json.dashboard && json.dashboard.support && json.dashboard.support.ads;
    
    console.log(`${hasDonation ? '✅' : '❌'} ${file} - Traducciones donación`);
    console.log(`${hasAds ? '✅' : '❌'} ${file} - Traducciones anuncios`);
    
    checks.push(
      { name: `${file} - Donations`, status: hasDonation },
      { name: `${file} - Ads`, status: hasAds }
    );
  } catch (error) {
    console.log(`❌ Error leyendo ${file}`);
    checks.push({ name: file, status: false });
  }
});

// Resumen final
console.log('\n📊 RESUMEN FINAL');
console.log('================');

const passed = checks.filter(check => check.status).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`✅ Verificaciones exitosas: ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 ¡PERFECTO! La aplicación está LISTA para despliegue');
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('1. Subir código a GitHub');
  console.log('2. Desplegar en Vercel/Netlify');
  console.log('3. Solicitar aprobación AdSense');
  console.log('4. Crear unidades de anuncio');
  console.log('5. Actualizar Slot IDs');
} else {
  console.log('\n⚠️ Algunas verificaciones fallaron:');
  checks.filter(check => !check.status).forEach(check => {
    console.log(`❌ ${check.name}`);
  });
}

console.log('\n📚 DOCUMENTACIÓN DISPONIBLE:');
console.log('- PRE_DEPLOYMENT_CHECKLIST.md');
console.log('- ADSENSE_DONATION_INTEGRATION.md');
console.log('- NEXT_STEPS_ADSENSE.md');
console.log('- INTEGRATION_COMPLETE.md');

console.log('\n' + '='.repeat(50));
