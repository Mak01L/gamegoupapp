"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

interface AdSpace {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  sponsor: string;
  type: 'gaming' | 'tech' | 'general';
}

interface AdWidgetProps {
  className?: string;
  variant?: 'sidebar' | 'banner' | 'card';
  type?: 'gaming' | 'tech' | 'general';
}

// Datos de ejemplo para anuncios (en una app real, esto vendría de una API)
const sampleAds: AdSpace[] = [
  {
    id: '1',
    title: 'Auriculares Gaming Pro',
    description: 'Audio inmersivo para gaming competitivo',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'AudioTech',
    type: 'gaming'
  },
  {
    id: '2',
    title: 'Servidor VPS Gaming',
    description: 'Hosting optimizado para servidores de juegos',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'CloudGaming',
    type: 'tech'
  },
  {
    id: '3',
    title: 'Comunidad Discord',
    description: 'Únete a miles de gamers en nuestra comunidad oficial',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'GameGoUp',
    type: 'general'
  },
  {
    id: '4',
    title: 'Monitor Gaming 144Hz',
    description: 'Experiencia visual superior para gaming',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'DisplayPro',
    type: 'gaming'
  },
  {
    id: '5',
    title: 'Curso de Game Dev',
    description: 'Aprende a crear tus propios videojuegos',
    imageUrl: '/logo.png',
    link: '#',
    sponsor: 'EduGame',
    type: 'tech'
  }
];

export default function AdWidget({ className = '', variant = 'card', type = 'gaming' }: AdWidgetProps) {
  const { t } = useTranslation('common');
  const [currentAd, setCurrentAd] = useState<AdSpace | null>(null);

  useEffect(() => {
    // Filtrar anuncios por tipo y seleccionar uno aleatorio
    const relevantAds = sampleAds.filter(ad => ad.type === type);
    if (relevantAds.length > 0) {
      const randomAd = relevantAds[Math.floor(Math.random() * relevantAds.length)];
      setCurrentAd(randomAd);
    }
  }, [type]);

  if (!currentAd) return null;

  const handleAdClick = () => {
    // En una implementación real, aquí se registraría el click para analytics
    console.log('Ad clicked:', currentAd.id);
    // window.open(currentAd.link, '_blank');
  };

  if (variant === 'sidebar') {
    return (
      <div className={`bg-neutral-900/50 border border-neutral-700/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.support.ads.sponsored')}</span>
        </div>
        <div className="flex gap-3">
          {currentAd.imageUrl && (
            <div className="flex-shrink-0">
              <Image 
                src={currentAd.imageUrl} 
                alt={currentAd.title}
                width={40}
                height={40}
                className="w-10 h-10 rounded object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">{currentAd.title}</h4>
            <p className="text-xs text-gray-400 truncate">{currentAd.description}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{currentAd.sponsor}</span>
              <button
                onClick={handleAdClick}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {t('dashboard.support.ads.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 border border-neutral-700/50 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentAd.imageUrl && (
              <Image 
                src={currentAd.imageUrl} 
                alt={currentAd.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-semibold">{currentAd.title}</h4>
                <span className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1 bg-neutral-800 rounded">
                  {t('dashboard.support.ads.sponsored')}
                </span>
              </div>
              <p className="text-sm text-gray-400">{currentAd.description}</p>
            </div>
          </div>
          <button
            onClick={handleAdClick}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
          >
            {t('dashboard.support.ads.learnMore')}
          </button>
        </div>
      </div>
    );
  }

  // variant === 'card'
  return (
    <div className={`bg-neutral-900 border border-neutral-700 rounded-xl p-4 group hover:border-neutral-600 transition-colors ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{t('dashboard.support.ads.sponsored')}</span>
        <span className="text-xs text-gray-600">•</span>
        <span className="text-xs text-gray-500">{currentAd.sponsor}</span>
      </div>
      
      {currentAd.imageUrl && (
        <div className="mb-3">
          <Image 
            src={currentAd.imageUrl} 
            alt={currentAd.title}
            width={200}
            height={120}
            className="w-full h-24 object-cover rounded-lg"
          />
        </div>
      )}
      
      <h4 className="text-white font-semibold mb-2 group-hover:text-violet-300 transition-colors">
        {currentAd.title}
      </h4>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
        {currentAd.description}
      </p>
      
      <button
        onClick={handleAdClick}
        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
      >
        {t('dashboard.support.ads.learnMore')}
      </button>
    </div>
  );
}
