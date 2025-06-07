// app/auth/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '../../components/AuthProvider'
import { useTranslation } from 'react-i18next'

export default function AuthPage() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isReset, setIsReset] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  // Si ya hay usuario autenticado, redirigir al dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Cargar datos recordados
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('gamegoup_email')
      const savedPassword = localStorage.getItem('gamegoup_password')
      if (savedEmail && savedPassword) {
        setEmail(savedEmail)
        setPassword(savedPassword)
        setRemember(true)
      }
    }
  }, [])
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setIsLoading(true)

    try {
      if (isLogin) {
        if (remember) {
          localStorage.setItem('gamegoup_email', email)
          localStorage.setItem('gamegoup_password', password)
        } else {
          localStorage.removeItem('gamegoup_email')
          localStorage.removeItem('gamegoup_password')
        }
        
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setError(error.message)
        }
        // La redirección se maneja automáticamente en AuthProvider
      } else {        if (!username.trim()) {
          setError(t('errors.usernameRequired'))
          return
        }
        if (password !== repeatPassword) {
          setError(t('errors.passwordsDontMatch'))
          return
        }
        if (password.length < 6) {
          setError(t('errors.passwordTooShort'))
          return
        }
        
        // Registro con user_metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } }
        })
        
        if (error) {
          setError(error.message)
        } else {
          // Actualizar el perfil de Supabase Auth para guardar el username en el campo 'username'
          if (data?.user) {
            await supabase.auth.updateUser({ data: { username } });
          }          setInfo(t('signupSuccess'))
          setIsLogin(true)
        }
      }    } catch (err) {
      setError(t('errors.unexpectedError'))
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        setError(error.message)      } else {
        setInfo(t('resetEmailSent'))
      }    } catch (err) {
      setError(t('errors.unexpectedError'))
      console.error('Reset error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Si ya hay usuario autenticado, no mostrar el formulario
  if (user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-300">{t('redirectingToDashboard')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">      <div className="w-full flex flex-col items-center justify-center mt-8 mb-4">
        <Image 
          src="/logo.png" 
          alt="GameGoUp Logo" 
          width={320} 
          height={320} 
          priority 
          className="w-80 h-80"
          sizes="320px"
        />
      </div><h1 className="text-3xl font-bold mb-4 text-violet-400">
        {isReset ? t('resetPassword') : isLogin ? t('loginTitle') : t('signupTitle')}
      </h1>
      <form onSubmit={isReset ? handleReset : handleAuth} className="flex flex-col gap-3 w-80 bg-neutral-900 p-6 rounded-xl border border-violet-700">        {!isLogin && !isReset && (
          <input
            type="text"
            placeholder={t('username')}
            className="p-2 rounded bg-black border border-violet-500 text-white"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            maxLength={20}
          />
        )}        <input
          type="email"
          placeholder={t('email')}
          className="p-2 rounded bg-black border border-violet-500 text-white"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {!isReset && (
          <>            <input
              type="password"
              placeholder={t('password')}
              className="p-2 rounded bg-black border border-violet-500 text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {!isLogin && (              <input
                type="password"
                placeholder={t('confirmPassword')}
                className="p-2 rounded bg-black border border-violet-500 text-white"
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
                required
              />
            )}
            {isLogin && (              <label className="flex items-center gap-2 text-sm text-violet-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                {t('remember')}
              </label>
            )}
          </>
        )}
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {info && <div className="text-green-400 text-sm">{info}</div>}        <button 
          type="submit" 
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border-2 border-red-500 hover:border-red-400"
          disabled={isLoading}
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}          {isLoading 
            ? t('loggingIn')
            : isReset 
              ? t('sendResetLink') 
              : isLogin 
                ? t('loginButton')
                : t('signupButton')
          }
        </button>
        <div className="flex flex-col gap-1 mt-2">          {!isReset && (
            <button
              type="button"
              className="text-red-400 hover:underline text-sm border border-red-400 rounded px-2 py-1 hover:bg-red-400 hover:text-white transition-colors"
              onClick={() => { setIsLogin(!isLogin); setError(''); setInfo('') }}
            >
              {isLogin ? t('switchToSignup') : t('switchToLogin')}
            </button>
          )}
          <button
            type="button"
            className="text-red-400 hover:underline text-sm border border-red-400 rounded px-2 py-1 hover:bg-red-400 hover:text-white transition-colors"
            onClick={() => { setIsReset(!isReset); setError(''); setInfo('') }}
          >
            {isReset ? t('backToLogin') : t('forgotPassword')}
          </button>
        </div>
      </form>
    </main>
  )
}
