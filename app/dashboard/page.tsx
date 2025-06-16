'use client'

import { useTranslation } from 'react-i18next'
import { useAuth } from '../../components/AuthProvider.simple'
import { useRouter } from 'next/navigation'
import AdManager from '../../components/AdManager'
import DonationWidget from '../../components/DonationWidget'

export default function DashboardPage() {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const router = useRouter()

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

  const trendingGames = [
    { name: 'Valorant', players: '2.1k', status: 'online', color: 'bg-red-500' },
    { name: 'League of Legends', players: '1.8k', status: 'online', color: 'bg-blue-500' },
    { name: 'Counter-Strike 2', players: '1.5k', status: 'online', color: 'bg-orange-500' },
    { name: 'Fortnite', players: '1.2k', status: 'online', color: 'bg-purple-500' },
    { name: 'World of Warcraft', players: '950', status: 'online', color: 'bg-yellow-500' },
    { name: 'Apex Legends', players: '780', status: 'online', color: 'bg-red-600' },
  ]

  const recentActivity = [
    { action: 'Nueva sala de Valorant creada', user: 'ProGamer123', time: '2 min', icon: '🎮' },
    { action: 'Torneo de LoL iniciado', user: 'EsportsTeam', time: '5 min', icon: '🏆' },
    { action: 'Raid de WoW programado', user: 'GuildMaster', time: '12 min', icon: '⚔️' },
    { action: 'Stream de CS2 en vivo', user: 'StreamerPro', time: '18 min', icon: '📺' },
  ]

  const tips = [
    'Usa el chat de voz para mejor coordinación en juegos competitivos',
    'Configura tu región para encontrar jugadores locales',
    'Únete a nuestra comunidad Discord para eventos especiales',
    'Reporta comportamiento tóxico para mantener un ambiente sano'
  ]

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🎮 ¡Hola de nuevo, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-xl text-gray-300">
            Listo para conquistar el mundo gaming hoy?
          </p>
        </div>

        {/* Banner Ad */}
        <div className="mb-8">
          <AdManager variant="banner" className="w-full" />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trending Games */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">🔥 Juegos Trending</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingGames.map((game, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${game.color}`}></div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{game.name}</h3>
                      <p className="text-sm text-gray-400">{game.players} jugadores activos</p>
                    </div>
                    <div className="text-green-400 text-sm">● Online</div>
                  </div>
                </div>
              ))}
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
                {recentActivity.map((activity, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="text-lg">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-400">por {activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
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

        {/* Community Stats */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">🌟 GameGoUp en Números</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-violet-400 mb-2">1,247</div>
              <div className="text-gray-300">Salas Activas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">15,832</div>
              <div className="text-gray-300">Gamers Conectados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">67</div>
              <div className="text-gray-300">Juegos Soportados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
              <div className="text-gray-300">Disponibilidad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
