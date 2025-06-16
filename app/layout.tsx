'use client'

import './globals.css'
import Script from 'next/script'
import { AuthProvider, useAuth } from '../components/AuthProvider.simple'
import I18nWrapper from '../components/I18nWrapper'
import { ChatProvider } from '../components/ChatManager'
import MainLayout from '../components/MainLayout'
import Footer from '../components/Footer'
import { useTranslation } from 'react-i18next'

function NavBar() {
  const { t, i18n } = useTranslation('common')
  const { user, signOut } = useAuth()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#292929] px-10 py-3 bg-black">
      <div className="flex items-center gap-4 text-[#FFFFFF]">
        <div className="size-4">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 4L29.2 14.2L40 14.2L31.4 20.6L34.4 31.8L24 25.4L13.6 31.8L16.6 20.6L8 14.2L18.8 14.2L24 4Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 className="text-[#FFFFFF] text-lg font-bold leading-tight tracking-[-0.015em]">
          GameGoUp
        </h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <a
            className="text-[#FFFFFF] text-sm font-medium leading-normal"
            href="/dashboard"
          >
            {t('navigation.dashboard')}
          </a>
          <a
            className="text-[#FFFFFF] text-sm font-medium leading-normal"
            href="/rooms"
          >
            {t('navigation.rooms')}
          </a>
          <a
            className="text-[#FFFFFF] text-sm font-medium leading-normal"
            href="/rooms/create"
          >
            {t('navigation.createRoom')}
          </a>
          <a
            className="text-[#FFFFFF] text-sm font-medium leading-normal"
            href="/profile"
          >
            {t('navigation.profile')}
          </a>
        </div>

        <div className="flex gap-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              aria-label="Seleccionar idioma"
              className="bg-[#292929] text-[#FFFFFF] text-sm border border-[#303030] rounded-lg px-3 py-2 focus:outline-none focus:border-[#EA2831]"
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[#ABABAB] text-sm">👋 {user.email}</span>
              <button
                onClick={signOut}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#EA2831] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#D41F28]"
              >
                {t('navigation.logout')}
              </button>
            </div>
          ) : (
            <a
              href="/auth"
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#EA2831] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#D41F28]"
            >
              {t('navigation.login')}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="GameGoUp - La plataforma definitiva para gamers. Conecta, juega y forma equipos con jugadores de todo el mundo. Salas de chat en tiempo real, comunidad gaming activa." />
        <meta name="keywords" content="gaming, gamers, chat, salas, videojuegos, multijugador, comunidad, esports" />
        <meta name="author" content="GameGoUp" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="GameGoUp - Plataforma Gaming Social" />
        <meta property="og:description" content="Conecta con gamers de todo el mundo. Crea salas, forma equipos y disfruta de la mejor experiencia gaming social." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo.png" />
        
        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GameGoUp - Plataforma Gaming Social" />
        <meta name="twitter:description" content="Conecta con gamers de todo el mundo" />
        
        <title>GameGoUp - Plataforma Gaming Social</title>
        <link rel="icon" href="/logo.png" type="image/png" />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7274762890410296"
          crossOrigin="anonymous"
        ></script>
        
        {/* Google Analytics - opcional para el futuro */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script> */}
      </head>
      <body className="min-h-screen bg-black font-inter flex flex-col">
        <AuthProvider>
          <I18nWrapper>
            <ChatProvider>
              <NavBar />
              <div className="flex-1">
                <MainLayout>{children}</MainLayout>
              </div>
              <Footer />
            </ChatProvider>
          </I18nWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
