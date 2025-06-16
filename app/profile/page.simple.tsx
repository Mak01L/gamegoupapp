export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">👤 Mi Perfil</h1>
        <p className="text-xl text-gray-300">Configura tu perfil de gamer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información básica */}
        <div className="lg:col-span-2 bg-violet-800/20 border border-violet-500 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            📋 Información Básica
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                placeholder="Tu nombre de gamer"
                className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Biografía
              </label>
              <textarea
                placeholder="Cuéntanos sobre ti..."
                rows={3}
                className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  🌍 Región
                </label>
                <select className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white">
                  <option value="">Seleccionar región</option>
                  <option value="latam">Latinoamérica</option>
                  <option value="na">Norteamérica</option>
                  <option value="eu">Europa</option>
                  <option value="asia">Asia</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  🏳️ País
                </label>
                <select className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white">
                  <option value="">Seleccionar país</option>
                  <option value="uy">Uruguay</option>
                  <option value="ar">Argentina</option>
                  <option value="br">Brasil</option>
                  <option value="cl">Chile</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar y estadísticas */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">🖼️ Avatar</h3>
            <div className="w-24 h-24 bg-violet-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
              👤
            </div>
            <button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg transition-colors">
              Cambiar Avatar
            </button>
          </div>

          {/* Estadísticas */}
          <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📊 Estadísticas
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Salas creadas:</span>
                <span className="text-white font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Mensajes enviados:</span>
                <span className="text-white font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Tiempo activo:</span>
                <span className="text-white font-bold">0h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Miembro desde:</span>
                <span className="text-white font-bold">Hoy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferencias de juego */}
      <div className="mt-6 bg-violet-800/20 border border-violet-500 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          🎮 Preferencias de Juego
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Juegos favoritos
            </label>
            <input
              type="text"
              placeholder="Ej: Valorant, League of Legends..."
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Plataformas
            </label>
            <input
              type="text"
              placeholder="Ej: PC, PlayStation, Xbox..."
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Horarios preferidos
            </label>
            <select className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white">
              <option value="">Seleccionar horario</option>
              <option value="morning">Mañana (6:00 - 12:00)</option>
              <option value="afternoon">Tarde (12:00 - 18:00)</option>
              <option value="evening">Noche (18:00 - 24:00)</option>
              <option value="night">Madrugada (24:00 - 6:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Nivel de juego
            </label>
            <select className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white">
              <option value="">Seleccionar nivel</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="pro">Profesional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-6 flex gap-4 justify-center">
        <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors">
          💾 Guardar Cambios
        </button>
        <button className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors">
          🚫 Cancelar
        </button>
      </div>
    </div>
  )
}
