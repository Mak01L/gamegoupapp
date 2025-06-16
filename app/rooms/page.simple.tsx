'use client'

import { useTranslation } from 'react-i18next'

export default function RoomsPage() {
  const { t } = useTranslation('common')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🔍 {t('misc.exploreRooms')}
        </h1>
        <p className="text-xl text-gray-300">
          Encuentra salas de juego y únete a la diversión
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('misc.searchPlaceholder')}
          className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
        />
      </div>

      {/* Botones de filtro */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-violet-600 text-white rounded-xl">
            🎛️ {t('misc.filters')}
          </button>
          <button className="px-4 py-2 bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 rounded-xl">
            🔄 {t('misc.refresh')}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
        <span>Mostrando 2 de 2 salas</span>
        <span>2 salas activas</span>
      </div>

      {/* Lista de salas */}
      <div className="grid gap-4">
        {/* Sala 1 */}
        <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-violet-300">
                  Crimson Shield
                </h3>
                <span className="flex items-center gap-1 text-sm text-green-400">
                  🔥 3 usuarios
                </span>
              </div>
              <p className="text-lg text-white">🎮 Gray Zone Warfare</p>
            </div>
            <button className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-6 rounded-lg transition-colors font-medium">
              🚪 Entrar
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-300">🌍 Regiones:</span>
              <p className="text-white">Suramérica</p>
            </div>
            <div>
              <span className="text-gray-300">🗣️ Idiomas:</span>
              <p className="text-white">Español</p>
            </div>
            <div>
              <span className="text-gray-300">🏳️ Países:</span>
              <p className="text-white">Uruguay</p>
            </div>
            <div>
              <span className="text-gray-300">💻 Sistemas:</span>
              <p className="text-white">PC</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Creado: 8/6/2025</span>
            <span>👥 2-10 jugadores</span>
          </div>
        </div>

        {/* Sala 2 */}
        <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-violet-300">Hshs</h3>
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  👤 1 usuario
                </span>
              </div>
              <p className="text-lg text-white">🎮 Minecraft</p>
            </div>
            <button className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-6 rounded-lg transition-colors font-medium">
              🚪 Entrar
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-300">🌍 Regiones:</span>
              <p className="text-white">Suramérica</p>
            </div>
            <div>
              <span className="text-gray-300">🗣️ Idiomas:</span>
              <p className="text-white">Español</p>
            </div>
            <div>
              <span className="text-gray-300">🏳️ Países:</span>
              <p className="text-white">Uruguay</p>
            </div>
            <div>
              <span className="text-gray-300">💻 Sistemas:</span>
              <p className="text-white">PC</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Creado: 8/6/2025</span>
            <span>👥 2-10 jugadores</span>
          </div>
        </div>
      </div>

      {/* Botón para crear nueva sala */}
      <div className="mt-8 text-center">
        <a
          href="/rooms/create"
          className="bg-violet-600 hover:bg-violet-700 text-white py-4 px-10 rounded-xl transition-colors font-bold text-xl shadow-lg border-2 border-violet-500 hover:border-violet-400"
        >
          ✨ Crear Nueva Sala
        </a>
      </div>
    </div>
  )
}
