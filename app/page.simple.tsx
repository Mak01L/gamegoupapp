export default function HomePage() {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-4">¡Bienvenido a GameGoUp! 🎮</h2>
      <p className="text-lg mb-8">
        Tu plataforma de gaming favorita está funcionando correctamente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="bg-green-600 p-4 rounded-lg">
          <p className="font-semibold">✅ Next.js está funcionando</p>
        </div>
        <div className="bg-green-600 p-4 rounded-lg">
          <p className="font-semibold">
            ✅ El styling con Tailwind está funcionando
          </p>
        </div>
        <div className="bg-green-600 p-4 rounded-lg">
          <p className="font-semibold">✅ La aplicación está lista para usar</p>
        </div>
      </div>

      <div className="mt-8">
        <a
          href="/auth"
          className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
        >
          Iniciar Sesión
        </a>
      </div>
    </div>
  )
}
