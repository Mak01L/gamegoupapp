'use client'

import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation('common')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎮 {t('navigation.dashboard')}
        </h1>
        <p className="text-xl text-gray-300">
          {t('dashboard.welcomeDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-violet-800/30 border border-violet-500 rounded-xl p-6 text-center">
          <div className="text-3xl mb-4">🏠</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {t('dashboard.statsCards.roomsCreated')}
          </h3>
          <p className="text-3xl font-bold text-violet-300">0</p>
        </div>

        <div className="bg-violet-800/30 border border-violet-500 rounded-xl p-6 text-center">
          <div className="text-3xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {t('dashboard.statsCards.activeRooms')}
          </h3>
          <p className="text-3xl font-bold text-green-400">0</p>
        </div>

        <div className="bg-violet-800/30 border border-violet-500 rounded-xl p-6 text-center">
          <div className="text-3xl mb-4">💬</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {t('dashboard.statsCards.messagesSent')}
          </h3>
          <p className="text-3xl font-bold text-blue-400">0</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            🚀 Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <a
              href="/rooms/create"
              className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors text-center"
            >
              ➕ Crear Sala
            </a>
            <a
              href="/rooms"
              className="block w-full bg-violet-600 hover:bg-violet-700 text-white py-3 px-4 rounded-lg transition-colors text-center"
            >
              🔍 Buscar Salas
            </a>
            <a
              href="/profile"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors text-center"
            >
              👤 Mi Perfil
            </a>
          </div>
        </div>

        <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">📈 Estadísticas</h3>
          <div className="space-y-2 text-gray-300">
            <p>• Tiempo total jugado: 0h</p>
            <p>• Juegos favoritos: --</p>
            <p>• Plataforma principal: --</p>
            <p>• Región: --</p>
          </div>
        </div>
      </div>
    </div>
  )
}
