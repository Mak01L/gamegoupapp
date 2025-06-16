'use client'

import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import AdManager from '../components/AdManager'

export default function HomePage() {
  const { t } = useTranslation(['common'])
  const router = useRouter()

  const gameFeatures = [
    {
      icon: '🎮',
      title: 'Salas de Gaming',
      description: 'Crea y únete a salas de chat para tus juegos favoritos. Encuentra compañeros de equipo y nuevos amigos.'
    },
    {
      icon: '🌍',
      title: 'Multijugador Global',
      description: 'Conecta con gamers de todo el mundo. Soportamos múltiples idiomas y regiones.'
    },
    {
      icon: '💬',
      title: 'Chat en Tiempo Real',
      description: 'Sistema de chat avanzado con mensajes instantáneos y moderación inteligente.'
    },
    {
      icon: '👥',
      title: 'Comunidad Activa',
      description: 'Únete a una comunidad vibrante de jugadores apasionados por los videojuegos.'
    }
  ]

  const popularGames = [
    'Valorant', 'League of Legends', 'Counter-Strike 2', 'Fortnite', 
    'World of Warcraft', 'Apex Legends', 'Overwatch 2', 'Rocket League'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
            🎮 GameGoUp
          </h1>
          <p className="text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            La plataforma definitiva para gamers. Conecta, juega y forma equipos con jugadores de todo el mundo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/rooms')}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              🔍 Explorar Salas
            </button>
            <button
              onClick={() => router.push('/rooms/create')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              ➕ Crear Sala
            </button>
          </div>
        </div>

        {/* Banner Ad */}
        <div className="mb-16">
          <AdManager variant="banner" className="mx-auto" />
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">
            ¿Por qué elegir GameGoUp?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gameFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Games Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">
            Juegos Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularGames.map((game, index) => (
              <div 
                key={index}
                className="bg-violet-800/50 rounded-lg p-4 text-center hover:bg-violet-700/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/rooms?game=${encodeURIComponent(game)}`)}
              >
                <div className="text-sm font-medium">{game}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Ad */}
        <div className="flex justify-center mb-16">
          <AdManager variant="sidebar" />
        </div>

        {/* Statistics Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Únete a miles de gamers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-violet-300 mb-2">1000+</div>
              <div className="text-gray-300">Salas Activas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-300 mb-2">50+</div>
              <div className="text-gray-300">Juegos Soportados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-300 mb-2">24/7</div>
              <div className="text-gray-300">Disponibilidad</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a GameGoUp hoy y descubre una nueva forma de conectar con la comunidad gaming.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 shadow-xl"
          >
            🚀 Comenzar Ahora
          </button>
        </div>
      </div>
    </div>
  )
}
