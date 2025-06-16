'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { usePathname, useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/auth']

  useEffect(() => {
    console.log('🔄 AuthProvider: Iniciando verificación de usuario...')

    // Obtener usuario inicial
    const getInitialUser = async () => {
      try {
        console.log('🔍 AuthProvider: Obteniendo usuario...')
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error('❌ AuthProvider: Error getting user:', error)
          setUser(null)
        } else {
          console.log(
            '✅ AuthProvider: Usuario obtenido:',
            user?.id || 'ninguno'
          )
          setUser(user)
        }
      } catch (error) {
        console.error('❌ AuthProvider: Error inesperado:', error)
        setUser(null)
      } finally {
        console.log('✅ AuthProvider: Terminando carga...')
        setLoading(false)
      }
    }

    getInitialUser()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
        // Redirigir a dashboard después del login
        if (pathname === '/auth' || pathname === '/') {
          router.push('/dashboard')
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        // Redirigir a auth después del logout
        router.push('/auth')
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  // Protección de rutas
  useEffect(() => {
    if (!loading) {
      console.log(
        `🔒 Protección de rutas - Usuario: ${user?.id || 'ninguno'}, Ruta: ${pathname}`
      )

      const isPublicRoute = publicRoutes.includes(pathname)

      if (!user && !isPublicRoute) {
        console.log('🔀 Redirigiendo a /auth (usuario no autenticado)')
        router.push('/auth')
      } else if (user && pathname === '/auth') {
        console.log(
          '🔀 Redirigiendo a /dashboard (usuario ya autenticado en /auth)'
        )
        router.push('/dashboard')
      } else if (user && pathname === '/') {
        console.log(
          '🔀 Redirigiendo a /dashboard (usuario autenticado en página inicial)'
        )
        router.push('/dashboard')
      }
    }
  }, [user, loading, pathname, router])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    } catch (error) {
      console.error('Error in signOut:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signOut,
  }

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    console.log('⏳ Mostrando pantalla de carga...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario y estamos en una ruta pública, mostrar el contenido
  // Si hay usuario o estamos cargando, mostrar el contenido
  const shouldShowContent = user || publicRoutes.includes(pathname)

  if (!shouldShowContent) {
    console.log('🔀 No se debe mostrar contenido, redirigiendo...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-white text-lg">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  console.log('✅ Mostrando contenido principal...')
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
