import './globals.css'

export const metadata = {
  title: 'GameGoUp - Minimal',
  description: 'Gaming Community - Versión Mínima',
}

export default function RootLayoutMinimal({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}
