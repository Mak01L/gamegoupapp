'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import Script from 'next/script'

interface AdSpace {
  id: string
  title: string
  description: string
  imageUrl?: string
  link: string
  sponsor: string
  type: 'gaming' | 'tech' | 'general' | 'adsense'
}

interface AdWidgetProps {
  className?: string
  variant?: 'sidebar' | 'banner' | 'card'
  type?: 'gaming' | 'tech' | 'general' | 'adsense'
  useAdsense?: boolean
}

// Datos de ejemplo para anuncios (en una app real, esto vendría de una API)
const sampleAds: AdSpace[] = [
  {
    id: 'adsense-1',
    title: 'Contenido Patrocinado por Google',
    description: 'Anuncios relevantes para gamers y tecnología',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'Google AdSense',
    type: 'adsense',
  },
  {
    id: '1',
    title: 'Únete a nuestra comunidad Discord',
    description: 'Conecta con miles de gamers, encuentra compañeros de juego y mantente al día con las últimas noticias',
    imageUrl: '/logo.png',
    link: 'https://discord.gg/nn77eeB',
    sponsor: 'GameGoUp Community',
    type: 'gaming',
  },
  {
    id: '2',
    title: 'Patrocina GameGoUp',
    description: 'Llega a miles de gamers con tu producto',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'GameGoUp Ads',
    type: 'tech',
  },
  {
    id: '3',
    title: 'Torneo Gaming Semanal',
    description: 'Participa en nuestros torneos semanales y gana premios increíbles',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'GameGoUp Events',
    type: 'general',
  },
  {
    id: '4',
    title: 'Auriculares Gaming Pro',
    description: 'Audio inmersivo para gaming competitivo',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'AudioTech',
    type: 'gaming',
  },
  {
    id: '5',
    title: 'Monitor Gaming 144Hz',
    description: 'Experiencia visual superior para gaming',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'DisplayPro',
    type: 'tech',
  },
]

export default function AdWidget({
  className = '',
  variant = 'card',
  type = 'adsense',
  useAdsense = true,
}: AdWidgetProps) {
  const { t } = useTranslation('common')
  const [currentAd, setCurrentAd] = useState<AdSpace | null>(null)

  // Si se solicita usar AdSense, mostrar el componente de AdSense
  if (useAdsense || type === 'adsense') {
    return (
      <div className={`${className}`}>
        {/* Script de Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7274762890410296"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Contenedor de anuncio AdSense */}
        <div className="bg-neutral-800/60 border-2 border-green-400/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-300 uppercase tracking-wide font-medium">
              🎮 Contenido Patrocinado - Google AdSense
            </span>
          </div>
          
          {/* Placeholder para anuncio real de AdSense */}
          <div className="min-h-[120px] bg-neutral-700/50 rounded-lg border border-dashed border-green-400/30 flex items-center justify-center">
            <div className="text-center text-gray-300">
              <div className="text-4xl mb-2">📢</div>
              <p className="text-sm font-medium">Espacio para Google AdSense</p>
              <p className="text-xs mt-1 text-green-400">ca-pub-7274762890410296</p>
              <p className="text-xs mt-2 text-gray-400">Anuncios relevantes para gamers</p>
              {/* 
              INSTRUCCIONES: Aquí insertarías el código real del anuncio:
              
              <ins className="adsbygoogle"
                   style={{display:"block"}}
                   data-ad-client="ca-pub-7274762890410296"
                   data-ad-slot="TU_SLOT_ID_AQUI"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              
              Y después ejecutar: (adsbygoogle = window.adsbygoogle || []).push({});
              */}
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Filtrar anuncios por tipo y seleccionar uno aleatorio
    const relevantAds = sampleAds.filter((ad) => ad.type === type)
    if (relevantAds.length > 0) {
      const randomAd =
        relevantAds[Math.floor(Math.random() * relevantAds.length)]
      setCurrentAd(randomAd)
    }
  }, [type])

  if (!currentAd) return null

  const handleAdClick = () => {
    // Registrar el click para analytics
    console.log('Ad clicked:', currentAd.id, currentAd.title)
    
    // Abrir enlace si existe
    if (currentAd.link && currentAd.link !== '#') {
      window.open(currentAd.link, '_blank', 'noopener,noreferrer')
    }
  }

  const getButtonText = () => {
    if (currentAd.title.includes('Discord')) return '💬 Unirse al Discord'
    if (currentAd.title.includes('Patrocina')) return '📧 Contactar'
    if (currentAd.title.includes('Torneo')) return '🏆 Participar'
    return '📖 Saber Más'
  }

  if (variant === 'sidebar') {
    return (
      <div
        className={`bg-neutral-800/60 border-2 border-violet-400/30 rounded-xl p-4 backdrop-blur-sm hover:bg-neutral-800/80 transition-all duration-200 ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-violet-300 uppercase tracking-wide font-medium">
            Contenido Patrocinado
          </span>
        </div>
        <div className="flex gap-3">
          {currentAd.imageUrl && (
            <div className="flex-shrink-0">
              <Image
                src={currentAd.imageUrl}
                alt={currentAd.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover border border-violet-400/20"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white mb-1 leading-tight">
              {currentAd.title}
            </h4>
            <p className="text-xs text-gray-200 leading-relaxed mb-2">
              {currentAd.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-violet-300 font-medium">{currentAd.sponsor}</span>
              <button
                onClick={handleAdClick}
                className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-md transition-all duration-200 font-medium"
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        className={`bg-gradient-to-r from-neutral-800/80 to-neutral-700/80 border-2 border-violet-400/30 rounded-2xl p-6 backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-violet-300 uppercase tracking-wide font-medium">
                Contenido Patrocinado • {currentAd.sponsor}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3">
          {currentAd.imageUrl && (
            <Image
              src={currentAd.imageUrl}
              alt={currentAd.title}
              width={64}
              height={64}
              className="w-16 h-16 rounded-xl object-cover border-2 border-violet-400/20"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              {currentAd.title}
            </h3>
            <p className="text-gray-200 leading-relaxed mb-3">
              {currentAd.description}
            </p>
            <button
              onClick={handleAdClick}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold text-sm"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // variant === 'card' (default)
  return (
    <div
      className={`bg-neutral-800/60 border-2 border-violet-400/30 rounded-2xl p-6 group hover:bg-neutral-800/80 transition-all duration-200 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-violet-300 uppercase tracking-wide font-medium">
          Contenido Patrocinado
        </span>
      </div>
      
      {currentAd.imageUrl && (
        <div className="mb-4 flex justify-center">
          <Image
            src={currentAd.imageUrl}
            alt={currentAd.title}
            width={80}
            height={80}
            className="w-20 h-20 rounded-xl object-cover border-2 border-violet-400/20"
          />
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
          {currentAd.title}
        </h3>
        <p className="text-gray-200 leading-relaxed mb-4 text-sm">
          {currentAd.description}
        </p>
        <div className="flex flex-col gap-3">
          <span className="text-sm text-violet-300 font-medium">
            Por {currentAd.sponsor}
          </span>
          <button
            onClick={handleAdClick}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold text-sm w-full transform hover:scale-105"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  )
}
