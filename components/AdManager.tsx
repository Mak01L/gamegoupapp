'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import GoogleAdSense from './GoogleAdSense'

interface AdManagerProps {
  className?: string
  variant?: 'sidebar' | 'banner' | 'card'
  adSlot?: string // Slot de AdSense específico
  fallbackAd?: {
    title: string
    description: string
    sponsor: string
    link: string
  }
}

export default function AdManager({
  className = '',
  variant = 'card',
  adSlot,
  fallbackAd,
}: AdManagerProps) {
  const { t } = useTranslation('common')
  const [useAdSense, setUseAdSense] = useState(true)
  const [adBlocked, setAdBlocked] = useState(false)
  const [adSenseReady, setAdSenseReady] = useState(false)

  useEffect(() => {
    // Cargar script de AdSense dinámicamente
    const loadAdSense = async () => {
      try {
        // Verificar si ya existe el script
        if (!document.querySelector('script[src*="googlesyndication.com"]')) {
          const script = document.createElement('script')
          script.async = true
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7274762890410296'
          script.crossOrigin = 'anonymous'
          document.head.appendChild(script)
          
          script.onload = () => {
            setAdSenseReady(true)
            console.log('AdSense loaded successfully')
          }
          
          script.onerror = () => {
            console.warn('AdSense failed to load, using fallback ads')
            setUseAdSense(false)
            setAdBlocked(true)
          }
        } else {
          setAdSenseReady(true)
        }
      } catch (error) {
        console.error('Error loading AdSense:', error)
        setUseAdSense(false)
      }
    }

    loadAdSense()
  }, [])

  // Función para obtener el texto del botón según el contenido
  const getButtonText = (title: string) => {
    if (title.includes('Discord')) return '💬 Unirse al Discord'
    if (title.includes('Patrocina')) return '📧 Contactar'
    if (title.includes('Torneo')) return '🏆 Participar'
    return '📖 Saber Más'
  }

  // Función para manejar clicks en fallback ads
  const handleFallbackClick = () => {
    const fallback = defaultFallbackAds[variant as keyof typeof defaultFallbackAds]
    if (fallback.link && fallback.link !== '#') {
      window.open(fallback.link, '_blank', 'noopener,noreferrer')
    }
    console.log('Fallback ad clicked:', fallback.title)
  }

  // Definir fallback ads por defecto según el variant
  const defaultFallbackAds = {
    sidebar: {
      title: 'Únete a nuestra comunidad Discord',
      description: 'Conecta con miles de gamers y encuentra compañeros de juego',
      sponsor: 'GameGoUp Community',
      link: 'https://discord.gg/nn77eeB',
    },
    banner: {
      title: 'Torneos Gaming Semanales',
      description:
        'Participa en nuestros torneos semanales y gana premios increíbles compitiendo con otros gamers',
      sponsor: 'GameGoUp Events',
      link: '#',
    },
    card: {
      title: 'Patrocina GameGoUp',
      description: 'Llegá a miles de gamers con tu producto',
      sponsor: 'GameGoUp Ads',
      link: '#',
    },
  }

  const currentFallback = fallbackAd || defaultFallbackAds[variant]

  // Definir slots de AdSense según el variant
  const getAdSenseSlot = () => {
    const slots = {
      sidebar: '1234567890',  // Reemplazar con tu slot real de AdSense
      banner: '2345678901',   // Reemplazar con tu slot real de AdSense
      card: '3456789012'      // Reemplazar con tu slot real de AdSense
    }
    return adSlot || slots[variant as keyof typeof slots] || slots.card
  }

  // Si AdSense está disponible y listo, mostrar anuncios de Google
  if (useAdSense && adSenseReady && !adBlocked) {
    if (variant === 'banner') {
      return (
        <div className={`bg-neutral-900/40 border border-green-700/30 rounded-xl p-4 ${className}`}>
          <div className="text-center mb-3">
            <span className="text-xs text-green-400 uppercase tracking-wide">
              🎮 Contenido Patrocinado - Google AdSense
            </span>
          </div>
          <GoogleAdSense 
            slot={getAdSenseSlot()} 
            format="horizontal" 
            className="w-full min-h-[120px]" 
          />
        </div>
      )
    }

    if (variant === 'sidebar') {
      return (
        <div className={`bg-neutral-900/40 border border-green-700/30 rounded-xl p-3 ${className}`}>
          <div className="text-center mb-2">
            <span className="text-xs text-green-400 uppercase tracking-wide">
              🎮 Contenido Patrocinado - Google AdSense
            </span>
          </div>
          <GoogleAdSense 
            slot={getAdSenseSlot()} 
            format="vertical" 
            className="w-full min-h-[200px]" 
          />
        </div>
      )
    }

    // variant === 'card'
    return (
      <div className={`bg-neutral-900/40 border border-green-700/30 rounded-xl p-4 ${className}`}>
        <div className="text-center mb-3">
          <span className="text-xs text-green-400 uppercase tracking-wide">
            🎮 Contenido Patrocinado - Google AdSense
          </span>
        </div>
        <GoogleAdSense 
          slot={getAdSenseSlot()} 
          format="rectangle" 
          className="w-full min-h-[250px]" 
        />
      </div>
    )
  }

  // Fallback: mostrar anuncio propio si AdSense no está disponible
  if (variant === 'banner') {
    return (
      <div
        className={`bg-gradient-to-r from-violet-900/20 to-blue-900/20 border border-violet-700/50 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎮</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-green-400 uppercase tracking-wide">
                  🎮 Contenido Patrocinado - Google AdSense (Fallback)
                </span>
                <span className="text-xs text-gray-600">•</span>
                <span className="text-xs text-gray-500">
                  {currentFallback.sponsor}
                </span>
              </div>
              <h4 className="text-white font-semibold text-lg">
                {currentFallback.title}
              </h4>
              <p className="text-gray-400 text-sm line-clamp-1">
                {currentFallback.description}
              </p>
            </div>
          </div>
          <button
            onClick={handleFallbackClick}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex-shrink-0"
          >
            {getButtonText(currentFallback.title)}
          </button>
        </div>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div
        className={`bg-gradient-to-b from-violet-900/20 to-blue-900/20 border border-violet-700/50 rounded-xl p-3 ${className}`}
      >
        <div className="text-center mb-2">
          <span className="text-xs text-green-400 uppercase tracking-wide">
            🎮 Contenido Patrocinado - Google AdSense (Fallback)
          </span>
        </div>
        <div className="text-center mb-3">
          <div className="text-2xl mb-2">🎯</div>
          <h4 className="text-white font-semibold text-sm mb-1">
            {currentFallback.title}
          </h4>
          <p className="text-gray-400 text-xs line-clamp-2">
            {currentFallback.description}
          </p>
        </div>
        <button
          onClick={handleFallbackClick}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          {getButtonText(currentFallback.title)}
        </button>
      </div>
    )
  }

  // variant === 'card'
  return (
    <div
      className={`bg-neutral-900 border border-neutral-700 rounded-xl p-4 group hover:border-neutral-600 transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-green-400 uppercase tracking-wide">
          🎮 Contenido Patrocinado - Google AdSense (Fallback)
        </span>
        <span className="text-xs text-gray-600">•</span>
        <span className="text-xs text-gray-500">{currentFallback.sponsor}</span>
      </div>

      <div className="text-center mb-3">
        <div className="text-3xl mb-2">📢</div>
      </div>

      <h4 className="text-white font-semibold mb-2 group-hover:text-violet-300 transition-colors">
        {currentFallback.title}
      </h4>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
        {currentFallback.description}
      </p>

      <button
        onClick={handleFallbackClick}
        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
      >
        {getButtonText(currentFallback.title)}
      </button>
    </div>
  )
}
