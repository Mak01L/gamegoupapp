"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GoogleAdSense from './GoogleAdSense';

interface AdManagerProps {
  className?: string;
  variant?: 'sidebar' | 'banner' | 'card';
  adSlot?: string; // Slot de AdSense específico
  fallbackAd?: {
    title: string;
    description: string;
    sponsor: string;
    link: string;
  };
}

export default function AdManager({ 
  className = '', 
  variant = 'card',
  adSlot,
  fallbackAd 
}: AdManagerProps) {
  const { t } = useTranslation('common');
  const [useAdSense, setUseAdSense] = useState(true);
  const [adBlocked, setAdBlocked] = useState(false);

  useEffect(() => {
    // Detectar si AdBlock está activo o si AdSense no está disponible
    const checkAdBlock = async () => {
      try {
        // Crear un elemento de prueba para detectar AdBlock
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-9999px';
        document.body.appendChild(testAd);
        
        setTimeout(() => {
          if (testAd.offsetHeight === 0) {
            setAdBlocked(true);
            setUseAdSense(false);
          }
          document.body.removeChild(testAd);
        }, 100);
      } catch {
        setUseAdSense(false);
      }
    };

    checkAdBlock();
  }, []);

  const handleFallbackClick = () => {
    if (fallbackAd?.link && fallbackAd.link !== '#') {
      window.open(fallbackAd.link, '_blank', 'noopener,noreferrer');
    }
  };

  // Definir fallback ads por defecto según el variant
  const defaultFallbackAds = {
    sidebar: {
      title: 'GameGoUp Pro',
      description: 'Funciones premium para gamers',
      sponsor: 'GameGoUp',
      link: '#'
    },
    banner: {
      title: 'Únete a nuestra comunidad Discord',
      description: 'Conecta con miles de gamers, encuentra compañeros de juego y mantente al día con las últimas noticias',
      sponsor: 'GameGoUp Community',
      link: '#'
    },
    card: {
      title: 'Patrocina GameGoUp',
      description: 'Llegá a miles de gamers con tu producto',
      sponsor: 'GameGoUp Ads',
      link: '#'
    }
  };

  const currentFallback = fallbackAd || defaultFallbackAds[variant];

  // Si AdSense está disponible y no bloqueado, mostrarlo
  if (useAdSense && !adBlocked && adSlot) {
    if (variant === 'banner') {
      return (
        <div className={`w-full ${className}`}>
          <div className="text-center mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {t('dashboard.support.ads.sponsored')}
            </span>
          </div>
          <GoogleAdSense 
            slot={adSlot}
            format="horizontal"
            className="w-full"
          />
        </div>
      );
    }

    if (variant === 'sidebar') {
      return (
        <div className={`${className}`}>
          <div className="text-center mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {t('dashboard.support.ads.sponsored')}
            </span>
          </div>
          <GoogleAdSense 
            slot={adSlot}
            format="vertical"
            className="w-full"
          />
        </div>
      );
    }

    // variant === 'card'
    return (
      <div className={`${className}`}>
        <div className="text-center mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {t('dashboard.support.ads.sponsored')}
          </span>
        </div>
        <GoogleAdSense 
          slot={adSlot}
          format="rectangle"
          className="w-full"
        />
      </div>
    );
  }

  // Fallback: mostrar anuncio propio si AdSense no está disponible
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-violet-900/20 to-blue-900/20 border border-violet-700/50 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎮</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('dashboard.support.ads.sponsored')}
                </span>
                <span className="text-xs text-gray-600">•</span>
                <span className="text-xs text-gray-500">{currentFallback.sponsor}</span>
              </div>
              <h4 className="text-white font-semibold text-lg">{currentFallback.title}</h4>
              <p className="text-gray-400 text-sm line-clamp-1">{currentFallback.description}</p>
            </div>
          </div>
          <button
            onClick={handleFallbackClick}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex-shrink-0"
          >
            {t('dashboard.support.ads.learnMore')}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`bg-gradient-to-b from-violet-900/20 to-blue-900/20 border border-violet-700/50 rounded-xl p-3 ${className}`}>
        <div className="text-center mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {t('dashboard.support.ads.sponsored')}
          </span>
        </div>
        <div className="text-center mb-3">
          <div className="text-2xl mb-2">🎯</div>
          <h4 className="text-white font-semibold text-sm mb-1">{currentFallback.title}</h4>
          <p className="text-gray-400 text-xs line-clamp-2">{currentFallback.description}</p>
        </div>
        <button
          onClick={handleFallbackClick}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          {t('dashboard.support.ads.learnMore')}
        </button>
      </div>
    );
  }

  // variant === 'card'
  return (
    <div className={`bg-neutral-900 border border-neutral-700 rounded-xl p-4 group hover:border-neutral-600 transition-colors ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {t('dashboard.support.ads.sponsored')}
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
        {t('dashboard.support.ads.learnMore')}
      </button>
    </div>
  );
}
