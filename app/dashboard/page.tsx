'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../components/AuthProvider.simple'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import AdManager from '../../components/AdManager'
import DonationWidget from '../../components/DonationWidget'

interface TrendingGame {
  name: string
  players: number
  status: 'online' | 'offline'
  color: string
  rooms: number
}

interface RecentActivity {
  action: string
  user: string
  time: string
  icon: string
  roomId?: string
}

interface AppStats {
  totalUsers: number
  activeUsers: number
  totalRooms: number
  activeRooms: number
  totalMessages: number
}

export default function DashboardPage() {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const router = useRouter()
  
  // Estados para datos reales
  const [trendingGames, setTrendingGames] = useState<TrendingGame[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [appStats, setAppStats] = useState<AppStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRooms: 0,
    activeRooms: 0,
    totalMessages: 0
  })
  const [loading, setLoading] = useState(true)

  // Función para cargar juegos trending (basados en salas activas)
  const loadTrendingGames = async () => {
    try {
      console.log('🔥 Cargando juegos trending...')
      
      const { data: roomsData, error } = await supabase
        .from('rooms')
        .select('id, juego')
        .not('juego', 'is', null)

      if (error) {
        console.error('❌ Error cargando juegos:', error)
        return
      }

      // Contar salas por juego
      const gameCount: { [key: string]: number } = {}
      roomsData?.forEach(room => {
        const game = room.juego
        gameCount[game] = (gameCount[game] || 0) + 1
      })

      // Obtener usuarios activos por juego
      const gamesWithUsers = await Promise.all(
        Object.entries(gameCount).map(async ([game, roomCount]) => {
          const { count: activeUsers } = await supabase
            .from('room_users')
            .select('*', { count: 'exact' })
            .eq('is_active', true)
            .in('room_id', 
              roomsData?.filter(r => r.juego === game).map(r => r.id) || []
            )

          const colors = {
            'Valorant': 'bg-red-500',
            'League of Legends': 'bg-blue-500',
            'Counter-Strike 2': 'bg-orange-500',
            'Fortnite': 'bg-purple-500',
            'World of Warcraft': 'bg-yellow-500',
            'Apex Legends': 'bg-red-600',
            'Overwatch 2': 'bg-orange-400',
            'Call of Duty': 'bg-green-600'
          }

          return {
            name: game,
            players: activeUsers || 0,
            status: 'online' as const,
            color: colors[game as keyof typeof colors] || 'bg-gray-500',
            rooms: roomCount
          }
        })
      )

      // Ordenar por jugadores activos
      const sortedGames = gamesWithUsers
        .sort((a, b) => b.players - a.players)
        .slice(0, 6)

      console.log('✅ Juegos trending cargados:', sortedGames.length)
      setTrendingGames(sortedGames)

    } catch (error) {
      console.error('❌ Error general cargando trending games:', error)
    }
  }

  // Función para cargar actividad reciente
  const loadRecentActivity = async () => {
    try {
      console.log('📈 Cargando actividad reciente...')

      // Obtener salas creadas recientemente
      const { data: recentRooms, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          id,
          nombre,
          juego,
          created_at,
          creador_id,
          profiles!rooms_creador_id_fkey(username)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (roomsError) {
        console.error('❌ Error cargando salas recientes:', roomsError)
        return
      }

      // Convertir a actividad reciente
      const activities: RecentActivity[] = (recentRooms || []).map(room => {
        const timeAgo = getTimeAgo(room.created_at)
        const username = Array.isArray(room.profiles) 
          ? room.profiles[0]?.username || `Usuario${room.creador_id?.slice(-4)}`
          : room.profiles?.username || `Usuario${room.creador_id?.slice(-4)}`
        
        const gameIcons: { [key: string]: string } = {
          'Valorant': '🎯',
          'League of Legends': '⚔️',
          'Counter-Strike 2': '🔫',
          'Fortnite': '🏗️',
          'World of Warcraft': '🗡️',
          'Apex Legends': '🏆',
          'Overwatch 2': '🤖',
          'Call of Duty': '💥'
        }

        return {
          action: `Nueva sala de ${room.juego} creada: "${room.nombre}"`,
          user: username,
          time: timeAgo,
          icon: gameIcons[room.juego] || '🎮',
          roomId: room.id
        }
      })

      console.log('✅ Actividad reciente cargada:', activities.length)
      setRecentActivity(activities.slice(0, 4))

    } catch (error) {
      console.error('❌ Error cargando actividad reciente:', error)
    }
  }

  // Función para cargar estadísticas de la app
  const loadAppStats = async () => {
    try {
      console.log('📊 Cargando estadísticas de la app...')

      const [
        totalUsersQuery,
        activeUsersQuery,
        totalRoomsQuery,
        activeRoomsQuery,
        totalMessagesQuery
      ] = await Promise.all([
        // Total de usuarios únicos en profiles
        supabase.from('profiles').select('id', { count: 'exact' }),
        
        // Usuarios activos (en salas activas)
        supabase.from('room_users').select('user_id').eq('is_active', true),
        
        // Total de salas
        supabase.from('rooms').select('id', { count: 'exact' }),
        
        // Salas activas (con usuarios)
        supabase.from('room_users').select('room_id').eq('is_active', true),
        
        // Total de mensajes
        supabase.from('chat_messages').select('id', { count: 'exact' })
      ])

      const uniqueActiveUsers = Array.from(
        new Set(activeUsersQuery.data?.map(u => u.user_id) || [])
      ).length

      const uniqueActiveRooms = Array.from(
        new Set(activeRoomsQuery.data?.map(r => r.room_id) || [])
      ).length

      const stats = {
        totalUsers: totalUsersQuery.count || 0,
        activeUsers: uniqueActiveUsers,
        totalRooms: totalRoomsQuery.count || 0,
        activeRooms: uniqueActiveRooms,
        totalMessages: totalMessagesQuery.count || 0
      }

      console.log('✅ Estadísticas cargadas:', stats)
      setAppStats(stats)

    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error)
    }
  }

  // Función auxiliar para calcular tiempo transcurrido
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'ahora'
    if (diffInMinutes < 60) return `${diffInMinutes} min`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`
    return `${Math.floor(diffInMinutes / 1440)} d`
  }

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      await Promise.all([
        loadTrendingGames(),
        loadRecentActivity(),
        loadAppStats()
      ])
      setLoading(false)
    }

    loadAllData()
  }, [])

  // Recargar datos cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Actualizando datos del dashboard...')
      loadTrendingGames()
      loadRecentActivity()
      loadAppStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const quickActions = [
    {
      title: 'Crear Sala Rápida',
      description: 'Configuración automática para tu juego favorito',
      icon: '⚡',
      action: () => router.push('/rooms/create'),
      color: 'bg-violet-600 hover:bg-violet-700'
    },
    {
      title: 'Explorar Comunidades',
      description: 'Descubre salas activas por juego',
      icon: '🔍',
      action: () => router.push('/rooms'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Mi Perfil',
      description: 'Personaliza tu experiencia gaming',
      icon: '👤',
      action: () => router.push('/profile'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Apoyo GameGoUp',
      description: 'Ayuda a mantener la plataforma',
      icon: '💝',
      action: () => {},
      color: 'bg-pink-600 hover:bg-pink-700',
      isWidget: true
    }
  ]

  const tips = [
    'Usa el chat de voz para mejor coordinación en juegos competitivos',
    'Configura tu región para encontrar jugadores locales',
    'Únete a nuestra comunidad Discord para eventos especiales',
    'Reporta comportamiento tóxico para mantener un ambiente sano'
  ]

  // Verificación de autenticación mejorada
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">🔒 Acceso Requerido</h1>
          <p className="text-xl mb-8">Inicia sesión para acceder a tu dashboard gaming</p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-violet-600 hover:bg-violet-700 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 px-4">
          <h1 className="text-4xl font-bold mb-2">
            🎮 ¡Hola de nuevo, {user?.email?.split('@')[0] || 'Gamer'}!
          </h1>
          <p className="text-xl text-gray-300">
            Listo para conquistar el mundo gaming hoy?
          </p>
        </div>

        {/* Banner Ad */}
        <div className="mb-8 px-4">
          <AdManager variant="banner" className="w-full" />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4">
          {quickActions.map((action, index) => (
            <div key={index} className="group">
              {action.isWidget ? (
                <DonationWidget 
                  variant="card"
                  className="h-full"
                />
              ) : (
                <button
                  onClick={action.action}
                  className={`${action.color} p-6 rounded-xl w-full h-full text-left transition-all transform group-hover:scale-105 shadow-lg`}
                >
                  <div className="text-3xl mb-3">{action.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
          {/* Trending Games */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">🔥 Juegos Trending</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                // Skeleton loading
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                      </div>
                      <div className="w-12 h-4 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ))
              ) : trendingGames.length > 0 ? (
                trendingGames.map((game, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${game.color}`}></div>
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-white transition-colors">{game.name}</h3>
                        <p className="text-sm text-gray-400">
                          {game.players} {game.players === 1 ? 'jugador activo' : 'jugadores activos'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {game.rooms} {game.rooms === 1 ? 'sala' : 'salas'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-green-400 text-sm font-medium">● Online</div>
                        <div className="text-xs text-gray-400">#{index + 1}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🎮</div>
                  <p>No hay juegos activos en este momento</p>
                  <p className="text-sm">¡Sé el primero en crear una sala!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sidebar Ad */}
            <AdManager variant="sidebar" />

            {/* Recent Activity */}
            <div>
              <h3 className="text-xl font-bold mb-4">📈 Actividad Reciente</h3>
              <div className="space-y-3">
                {loading ? (
                  // Skeleton loading para actividad reciente
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-600 rounded mb-2"></div>
                          <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div 
                      key={index} 
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer"
                      onClick={() => activity.roomId && router.push(`/room/${activity.roomId}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">{activity.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{activity.action}</p>
                          <p className="text-xs text-gray-400">
                            por <span className="text-green-400">{activity.user}</span> • <span className="text-blue-400">{activity.time}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <div className="text-2xl mb-2">📈</div>
                    <p className="text-sm">No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-xl font-bold mb-4">💡 Tip del Día</h3>
              <div className="bg-gradient-to-r from-violet-900/50 to-blue-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  {tips[Math.floor(Math.random() * tips.length)]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Ads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <AdManager variant="card" />
          <AdManager variant="card" />
        </div>

        {/* Community Stats - DATOS REALES */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">🌟 GameGoUp en Números</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-12 bg-gray-600 rounded mb-2 mx-auto w-24"></div>
                  <div className="h-4 bg-gray-700 rounded mx-auto w-32"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-violet-400 mb-2">
                  {appStats.activeRooms.toLocaleString()}
                </div>
                <div className="text-gray-300">Salas Activas</div>
                <div className="text-xs text-gray-500 mt-1">
                  {appStats.totalRooms} total
                </div>
              </div>
              <div className="hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {appStats.activeUsers.toLocaleString()}
                </div>
                <div className="text-gray-300">Gamers Online</div>
                <div className="text-xs text-gray-500 mt-1">
                  {appStats.totalUsers} registrados
                </div>
              </div>
              <div className="hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {appStats.totalMessages.toLocaleString()}
                </div>
                <div className="text-gray-300">Mensajes Enviados</div>
                <div className="text-xs text-gray-500 mt-1">
                  Total en la plataforma
                </div>
              </div>
              <div className="hover:scale-105 transition-transform">
                <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
                <div className="text-gray-300">Disponibilidad</div>
                <div className="text-xs text-gray-500 mt-1">
                  Siempre online
                </div>
              </div>
            </div>
          )}
          
          {/* Botón de actualización manual */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                loadTrendingGames()
                loadRecentActivity()
                loadAppStats()
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              disabled={loading}
            >
              {loading ? '⏳ Actualizando...' : '🔄 Actualizar Datos'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Datos actualizados automáticamente cada 30 segundos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
