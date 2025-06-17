import './globals.css'

export const metadata = {
  title: 'GameGoUp - Gaming Community (Basic)',
  description: 'Conecta con gamers y encuentra tu squad perfecto - Versión Básica',
}

export default function RootLayoutBasic({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-900 text-white">
        <div className="min-h-screen">
          <header className="bg-black p-4">
            <h1 className="text-2xl font-bold">🎮 GameGoUp Basic</h1>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
