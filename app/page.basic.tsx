export default function PageBasic() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">🎮 GameGoUp Basic</h1>
      <p className="text-lg text-gray-300 mb-4">
        Bienvenido a la versión básica de GameGoUp
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🎯 Encuentra Gamers</h2>
          <p className="text-gray-400">
            Conecta con jugadores de tu nivel y forma el squad perfecto.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🚀 Juega Juntos</h2>
          <p className="text-gray-400">
            Organiza partidas y conquista el ranking en equipo.
          </p>
        </div>
      </div>
    </div>
  )
}
