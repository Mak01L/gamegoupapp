import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div
          style={{
            padding: '20px',
            color: 'white',
            backgroundColor: 'black',
            minHeight: '100vh',
          }}
        >
          <h1>🎮 GameGoUp - Debug Mode</h1>
          <p>Si ves esto, el layout básico funciona.</p>
          {children}
        </div>
      </body>
    </html>
  )
}
