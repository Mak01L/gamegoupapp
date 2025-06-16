export default function CreateRoomPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <a
          href="/rooms"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
        >
          ← Volver a buscar salas
        </a>
        <h1 className="text-4xl font-bold text-white mb-4">➕ Crear Sala</h1>
        <p className="text-xl text-gray-300">Crea una nueva sala de juego</p>
      </div>

      <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6">
        <div className="space-y-4">
          {/* Nombre de la sala */}
          <div>
            <input
              type="text"
              placeholder="Ej: Squad para Ranked"
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
            />
          </div>

          {/* Juego */}
          <div>
            <input
              type="text"
              placeholder="Juego"
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
            />
          </div>

          {/* Región */}
          <div>
            <label className="flex items-center gap-2 text-violet-300 font-medium mb-2">
              🌍 Región
            </label>
            <input
              type="text"
              placeholder="Región"
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
            />
          </div>

          {/* Idioma */}
          <div>
            <label className="flex items-center gap-2 text-violet-300 font-medium mb-2">
              🗣️ Idioma
            </label>
            <input
              type="text"
              placeholder="Idioma"
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
            />
          </div>

          {/* País (Opcional) */}
          <div>
            <label className="flex items-center gap-2 text-violet-300 font-medium mb-2">
              🏳️ País
              <span className="text-gray-400 text-sm">(opcional)</span>
              <span
                className="text-yellow-400 cursor-help"
                title="Opcionalmente especifica qué países son preferidos para esta sala"
              >
                ℹ️
              </span>
            </label>
            <input
              type="text"
              placeholder="Seleccionar países (opcional)"
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
            />
          </div>

          {/* Plataforma */}
          <div>
            <label className="flex items-center gap-2 text-violet-300 font-medium mb-2">
              💻 Plataforma
            </label>
            <input
              type="text"
              placeholder="Plataforma"
              className="w-full p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
            />
          </div>

          {/* Número de jugadores */}
          <div>
            <label className="flex items-center gap-2 text-violet-300 font-medium mb-2">
              👥 Número de jugadores
              <span
                className="text-yellow-400 cursor-help"
                title="Especifica el número mínimo y máximo de jugadores para la sala (entre 2-50)"
              >
                ℹ️
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="2"
                max="50"
                placeholder="Mín. jugadores (2-50)"
                className="p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
                defaultValue="2"
              />
              <input
                type="number"
                min="2"
                max="50"
                placeholder="Máx. jugadores (2-50)"
                className="p-3 bg-black border border-violet-500 rounded-xl text-white placeholder-gray-400"
                defaultValue="10"
              />
            </div>
          </div>

          {/* Botón crear */}
          <button className="w-full mt-6 px-6 py-4 bg-violet-600 hover:bg-violet-700 rounded-xl text-lg font-bold text-white transition-colors shadow-lg border-2 border-violet-500 hover:border-violet-400">
            ✨ Crear sala
          </button>
        </div>
      </div>
    </div>
  )
}
