'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        // Iniciar sesión
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setMessage(`Error: ${error.message}`)
        } else {
          setMessage('¡Sesión iniciada correctamente!')
          router.push('/dashboard')
        }
      } else {
        // Registrarse
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setMessage(`Error: ${error.message}`)
        } else {
          setMessage('¡Cuenta creada! Revisa tu email para confirmar.')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setMessage('Error inesperado. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🔐 {isLogin ? t('navigation.login') : 'Crear Cuenta'}
        </h1>
        <p className="text-xl text-gray-300">
          {isLogin
            ? 'Accede a tu cuenta de GameGoUp'
            : 'Únete a la comunidad GameGoUp'}
        </p>
      </div>

      <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6">
        <form onSubmit={handleAuth} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-white font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-white font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
              required
              minLength={6}
            />
          </div>

          {/* Mensaje */}
          {message && (
            <div
              className={`p-3 rounded-xl text-center ${
                message.includes('Error')
                  ? 'bg-red-600/20 text-red-300'
                  : 'bg-green-600/20 text-green-300'
              }`}
            >
              {message}
            </div>
          )}

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 rounded-xl font-bold text-white transition-colors"
          >
            {loading
              ? '⏳ Procesando...'
              : isLogin
                ? '🚀 Iniciar Sesión'
                : '➕ Crear Cuenta'}
          </button>

          {/* Separador */}
          <div className="text-center text-gray-400 my-6">
            ────────── o ──────────
          </div>

          {/* Cambiar modo */}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
            }}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white transition-colors"
          >
            {isLogin ? '➕ Crear Cuenta Nueva' : '🚀 Ya tengo cuenta'}{' '}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <a
            href="#"
            className="block text-violet-300 hover:text-violet-200 text-sm"
          >
            ¿Olvidaste tu contraseña?
          </a>
          <a
            href="/"
            className="block text-gray-400 hover:text-gray-300 text-sm"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>

      {/* Información adicional */}
      <div className="text-center mt-8 text-gray-400 text-sm">
        <p>🎮 Únete a la comunidad de gamers más grande</p>
        <p>• Encuentra compañeros de juego</p>
        <p>• Crea y únete a salas</p>
        <p>• Chat en tiempo real</p>
      </div>
    </div>
  )
}
