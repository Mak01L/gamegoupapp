'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'

interface DashboardStats {
  totalRooms: number
  activeRooms: number
  totalMessages: number
  userRooms: number
  activeUsers: number
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    activeRooms: 0,
    totalMessages: 0,
    userRooms: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Obtener usuario actual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        setUser(user) // Cargar estadísticas en paralelo
        const [
          totalRoomsQuery,
          activeRoomsQuery,
          totalMessagesQuery,
          userRoomsQuery,
          activeUsersQuery,
        ] = await Promise.all([
          // Total de salas
          supabase.from('rooms').select('id', { count: 'exact' }),

          // Salas activas (con usuarios activos)
          supabase.from('room_users').select('room_id').eq('is_active', true),

          // Total de mensajes
          supabase.from('chat_messages').select('id', { count: 'exact' }),

          // Salas del usuario actual
          user
            ? supabase
                .from('rooms')
                .select('id', { count: 'exact' })
                .eq('creador_id', user.id)
            : { count: 0 },

          // Usuarios activos únicos
          supabase.from('room_users').select('user_id').eq('is_active', true),
        ]) // Calcular salas activas únicas
        const uniqueActiveRooms = activeRoomsQuery.data
          ? Array.from(
              new Set(activeRoomsQuery.data.map((item) => item.room_id))
            ).length
          : 0

        // Calcular usuarios activos únicos
        const uniqueActiveUsers = activeUsersQuery.data
          ? Array.from(
              new Set(activeUsersQuery.data.map((item) => item.user_id))
            ).length
          : 0

        setStats({
          totalRooms: totalRoomsQuery.count || 0,
          activeRooms: uniqueActiveRooms,
          totalMessages: totalMessagesQuery.count || 0,
          userRooms: userRoomsQuery.count || 0,
          activeUsers: uniqueActiveUsers,
        })
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-500/20 rounded-2xl p-8">
          <h1 className="text-5xl font-bold mb-4 text-white">
            🎮 GameGoUp
            {user && (
              <span className="block text-3xl text-violet-300 mt-3 font-medium">
                👋 Bienvenido, {user.email?.split('@')[0] || 'Gamer'}
              </span>
            )}
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-400"></div>
                Cargando datos del dashboard...
              </span>
            ) : (
              'Plataforma de gaming y chat en tiempo real para conectar con jugadores de todo el mundo'
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-6 mb-12">
          <button
            onClick={() => router.push('/rooms')}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔍 Explorar Salas
          </button>
          <button
            onClick={() => router.push('/rooms/create')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ➕ Crear Nueva Sala
          </button>
        </div>        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-violet-900/40 border-2 border-violet-400/50 rounded-2xl p-8 text-center backdrop-blur-sm hover:bg-violet-900/60 transition-all duration-200">
            <div className="text-5xl font-bold text-violet-200 mb-3">
              {loading ? '...' : stats.totalRooms}
            </div>
            <div className="text-gray-100 text-lg font-medium">Total de Salas</div>
            <div className="text-violet-300 text-sm mt-1">En la plataforma</div>
          </div>

          <div className="bg-blue-900/40 border-2 border-blue-400/50 rounded-2xl p-8 text-center backdrop-blur-sm hover:bg-blue-900/60 transition-all duration-200">
            <div className="text-5xl font-bold text-blue-200 mb-3">
              {loading ? '...' : stats.activeRooms}
            </div>
            <div className="text-gray-100 text-lg font-medium">Salas Activas</div>
            <div className="text-blue-300 text-sm mt-1">Con jugadores online</div>
          </div>

          <div className="bg-green-900/40 border-2 border-green-400/50 rounded-2xl p-8 text-center backdrop-blur-sm hover:bg-green-900/60 transition-all duration-200">
            <div className="text-5xl font-bold text-green-200 mb-3">
              {loading ? '...' : stats.totalMessages}
            </div>
            <div className="text-gray-100 text-lg font-medium">Mensajes</div>
            <div className="text-green-300 text-sm mt-1">Total enviados</div>
          </div>

          <div className="bg-orange-900/40 border-2 border-orange-400/50 rounded-2xl p-8 text-center backdrop-blur-sm hover:bg-orange-900/60 transition-all duration-200">
            <div className="text-5xl font-bold text-orange-200 mb-3">
              {loading ? '...' : stats.activeUsers}
            </div>
            <div className="text-gray-100 text-lg font-medium">Usuarios Activos</div>
            <div className="text-orange-300 text-sm mt-1">Conectados ahora</div>
          </div>
        </div>

          <div className="bg-green-800/30 border border-green-500/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-300 mb-2">
              {loading ? '...' : stats.totalMessages}
            </div>
            <div className="text-gray-300">Mensajes Total</div>
          </div>

          <div className="bg-orange-800/30 border border-orange-500/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-300 mb-2">
              {loading ? '...' : stats.activeUsers}
            </div>
            <div className="text-gray-300">Usuarios Activos</div>
          </div>
        </div>
        {/* User Stats (si está autenticado) */}
        {user && (
          <div className="bg-gradient-to-r from-violet-900/60 to-purple-900/60 border-2 border-violet-400/40 rounded-2xl p-8 mb-12 backdrop-blur-sm">
            <h3 className="text-3xl font-bold mb-6 text-center text-white">
              📊 Tus Estadísticas Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center bg-yellow-900/30 border border-yellow-400/30 rounded-xl p-6">
                <div className="text-6xl font-bold text-yellow-200 mb-3">
                  {loading ? '...' : stats.userRooms}
                </div>
                <div className="text-gray-100 text-xl font-medium">Salas Creadas</div>
                <div className="text-yellow-300 text-sm mt-1">Por ti</div>
              </div>
              <div className="text-center bg-cyan-900/30 border border-cyan-400/30 rounded-xl p-6">
                <div className="text-3xl font-bold text-cyan-200 mb-3 font-mono">
                  {user.id?.slice(-8) || 'Usuario'}
                </div>
                <div className="text-gray-100 text-xl font-medium">ID de Usuario</div>
                <div className="text-cyan-300 text-sm mt-1">Tu identificador único</div>
              </div>
            </div>
          </div>
        )}
        {/* Features */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">🌟 Características Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-800/60 border-2 border-violet-400/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-800/80 transition-all duration-200">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Múltiples Juegos</h3>
              <p className="text-gray-200 leading-relaxed">
                Encuentra jugadores para todos tus juegos favoritos: FPS, MOBA, Battle Royale y más
              </p>
            </div>

            <div className="bg-neutral-800/60 border-2 border-blue-400/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-800/80 transition-all duration-200">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Regiones Globales</h3>
              <p className="text-gray-200 leading-relaxed">
                Conecta con jugadores de todo el mundo o encuentra compañeros locales
              </p>
            </div>

            <div className="bg-neutral-800/60 border-2 border-green-400/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-800/80 transition-all duration-200">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Chat en Tiempo Real</h3>
              <p className="text-gray-200 leading-relaxed">
                Comunícate instantáneamente con tu equipo y coordina estrategias
              </p>
            </div>

            <div className="bg-neutral-800/60 border-2 border-orange-400/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-800/80 transition-all duration-200">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Filtros Avanzados</h3>
              <p className="text-gray-200 leading-relaxed">
                Encuentra exactamente lo que buscas con filtros por juego, región y más
              </p>
            </div>

            <div className="bg-neutral-800/60 border-2 border-cyan-400/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-800/80 transition-all duration-200">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Rápido y Fácil</h3>
              <p className="text-gray-200 leading-relaxed">
                Crea salas en segundos y empieza a jugar inmediatamente
              </p>
            </div>

            <div className="bg-neutral-800/60 border-2 border-pink-400/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-800/80 transition-all duration-200">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Seguro y Confiable</h3>
              <p className="text-gray-200 leading-relaxed">
                Plataforma segura con moderación automática y controles de privacidad
              </p>
            </div>

            <div className="bg-neutral-800/60 border-2 border-emerald-400/30 rounded-2xl p-8 backdrop-blur-sm hover:bg-neutral-800/80 transition-all duration-200">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Comunidad Activa</h3>
              <p className="text-gray-200 leading-relaxed">
                Únete a miles de jugadores en una comunidad vibrante
              </p>
            </div>
          </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">¿Listo para jugar?</h2>
          <button
            onClick={() => router.push('/rooms/create')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105"
          >
            🚀 Crear tu Primera Sala
          </button>
        </div>
      </div>
    </div>
  )
}
