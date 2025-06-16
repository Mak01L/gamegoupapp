'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../lib/i18n'

interface I18nWrapperProps {
  children: React.ReactNode
}

export default function I18nWrapper({ children }: I18nWrapperProps) {
  const { i18n } = useTranslation()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const checkReady = () => {
      if (
        i18n.isInitialized &&
        i18n.hasResourceBundle(i18n.language, 'common')
      ) {
        setIsReady(true)
      } else {
        // Reintentar en 100ms
        setTimeout(checkReady, 100)
      }
    }

    checkReady()
  }, [i18n])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Cargando traducciones... ⏳</div>
      </div>
    )
  }

  return <>{children}</>
}
