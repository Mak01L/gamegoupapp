console.log('🔨 Iniciando verificación de build...')

try {
  const { execSync } = require('child_process')

  console.log('📦 Ejecutando npm run build...')
  const result = execSync('npm run build', {
    cwd: 'd:\\gamer-chat-app',
    encoding: 'utf8',
    stdio: 'pipe',
  })

  console.log('✅ Build exitoso!')
  console.log(result)
} catch (error) {
  console.log('❌ Error en el build:')
  console.log(error.message)
  if (error.stdout) {
    console.log('STDOUT:', error.stdout)
  }
  if (error.stderr) {
    console.log('STDERR:', error.stderr)
  }
}
