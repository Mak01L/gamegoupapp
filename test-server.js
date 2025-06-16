// Test simple para verificar si el servidor está funcionando
console.log('🚀 Verificando servidor...')

// Test de conectividad básica
fetch('http://localhost:3000')
  .then((response) => {
    console.log('✅ Servidor responde:', response.status)
    return response.text()
  })
  .then((html) => {
    console.log('📄 HTML recibido (primeros 500 caracteres):')
    console.log(html.substring(0, 500))
    if (html.includes('<!DOCTYPE html>')) {
      console.log('✅ HTML válido detectado')
    } else {
      console.log('❌ HTML parece incompleto')
    }
  })
  .catch((error) => {
    console.log('❌ Error de conexión:', error)
  })
