import './globals.css'

export const metadata = {
  title: 'GameGoUp - Simple Layout',
  description: 'Gaming Community - Layout Simple',
}

export default function RootLayoutSimple({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-neutral-900 text-white">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
