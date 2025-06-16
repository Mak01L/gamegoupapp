'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
    <div
      className="relative flex size-full min-h-screen flex-col bg-black"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#292929] px-10 py-3">
          <div className="flex items-center gap-4 text-[#FFFFFF]">
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 4L29.2 14.2L40 14.2L31.4 20.6L34.4 31.8L24 25.4L13.6 31.8L16.6 20.6L8 14.2L18.8 14.2L24 4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-[#FFFFFF] text-lg font-bold leading-tight tracking-[-0.015em]">
              GameGoUp
            </h2>
          </div>
        </header>

        {/* Main content with two columns */}
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-[1200px] px-10 py-5">
            {/* Left side - Auth form */}
            <div className="flex flex-col w-[512px] max-w-[512px] py-5">
              <h2 className="text-[#FFFFFF] text-lg font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-2 pt-4">
                {isLogin
                  ? `${t('navigation.login')} GameGoUp`
                  : 'Crear cuenta en GameGoUp'}
              </h2>

              <form onSubmit={handleAuth}>
                {/* Email field */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#FFFFFF] text-base font-medium leading-normal pb-2">
                      Email
                    </p>
                    <input
                      type="email"
                      placeholder="Ingresa tu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#FFFFFF] focus:outline-0 focus:ring-0 border border-[#303030] bg-[#212121] focus:border-[#303030] h-14 placeholder:text-[#ABABAB] p-[15px] text-base font-normal leading-normal"
                      required
                    />
                  </label>
                </div>

                {/* Password field */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#FFFFFF] text-base font-medium leading-normal pb-2">
                      Contraseña
                    </p>
                    <input
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#FFFFFF] focus:outline-0 focus:ring-0 border border-[#303030] bg-[#212121] focus:border-[#303030] h-14 placeholder:text-[#ABABAB] p-[15px] text-base font-normal leading-normal"
                      required
                      minLength={6}
                    />
                  </label>
                </div>

                {isLogin && (
                  <p className="text-[#ABABAB] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline cursor-pointer">
                    ¿Olvidaste tu contraseña?
                  </p>
                )}

                {/* Message display */}
                {message && (
                  <div
                    className={`mx-4 my-3 p-3 rounded-xl text-sm ${
                      message.includes('Error')
                        ? 'bg-red-900/20 text-red-300 border border-red-800'
                        : 'bg-green-900/20 text-green-300 border border-green-800'
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Main action button */}
                <div className="flex px-4 py-3 justify-start">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#EA2831] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em] disabled:bg-[#EA2831]/50"
                  >
                    <span className="truncate">
                      {loading
                        ? 'Procesando...'
                        : isLogin
                          ? 'Iniciar sesión'
                          : 'Crear cuenta'}
                    </span>
                  </button>
                </div>

                {/* Switch mode */}
                <p className="text-[#ABABAB] text-sm font-normal leading-normal pb-3 pt-1 px-4">
                  {isLogin
                    ? '¿No tienes una cuenta?'
                    : '¿Ya tienes una cuenta?'}
                </p>
                <div className="flex px-4 py-3 justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setMessage('')
                    }}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#292929] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em]"
                  >
                    <span className="truncate">
                      {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right side - Logo */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="flex flex-col items-center space-y-6 max-w-sm">
                <div className="relative w-64 h-64">
                  <Image
                    src="/assets/logo.png"
                    alt="GameGoUp Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-[#FFFFFF] text-2xl font-bold mb-2">
                    ¡Bienvenido a GameGoUp!
                  </h3>
                  <p className="text-[#ABABAB] text-base leading-relaxed">
                    Conecta con gamers de todo el mundo, crea salas de juego y
                    disfruta de la mejor experiencia gaming en comunidad.
                  </p>
                </div>
              </div>{' '}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
