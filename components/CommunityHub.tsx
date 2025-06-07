"use client";

import { useTranslation } from 'react-i18next';
import DonationWidget from './DonationWidget';
import AdManager from './AdManager';
import { getAdConfig } from '../lib/adConfig';

interface CommunityHubProps {
  className?: string;
  showDonation?: boolean;
  showAds?: boolean;
}

export default function CommunityHub({ 
  className = '', 
  showDonation = true, 
  showAds = true 
}: CommunityHubProps) {
  const { t } = useTranslation('common');
  
  // Obtener configuraciones de anuncios
  const gamingAdConfig = getAdConfig('gaming');
  const techAdConfig = getAdConfig('tech');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Community Section Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-violet-400 mb-2">
          {t('community.title', 'Comunidad GameGoUp')}
        </h3>
        <p className="text-gray-400 text-sm">
          {t('community.description', 'Únete a nuestra comunidad y ayuda a hacer GameGoUp aún mejor')}
        </p>
      </div>

      {/* Grid de elementos de comunidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Widget de donación */}
        {showDonation && (
          <DonationWidget variant="card" />
        )}        {/* Anuncios de gaming */}
        {showAds && (
          <>
            <AdManager 
              variant="card" 
              adSlot={gamingAdConfig.slot}
              fallbackAd={gamingAdConfig.fallback}
            />
            <AdManager 
              variant="card" 
              adSlot={techAdConfig.slot}
              fallbackAd={techAdConfig.fallback}
            />
          </>
        )}        {/* Widget de redes sociales */}
        <div className="bg-gradient-to-r from-violet-900/20 to-blue-900/20 border border-violet-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🌐</div>
            <div>
              <h4 className="text-violet-400 font-semibold text-sm">
                {t('community.social.title', 'Redes Sociales')}
              </h4>
              <p className="text-gray-400 text-xs">
                {t('community.social.description', 'Síguenos en nuestras redes')}
              </p>
            </div>
          </div>
          
          {/* Botones de redes sociales */}
          <div className="space-y-2">
            <button
              onClick={() => {
                window.open('https://discord.gg/SN5T9jfper', '_blank');
              }}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              {t('community.discord.join', 'Unirse a Discord')}
            </button>
            
            <button
              onClick={() => {
                window.open('https://x.com/GameGoUp', '_blank');
              }}
              className="w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {t('community.twitter.follow', 'Seguir en X')}
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter/Updates Section */}
      <div className="bg-neutral-900/50 border border-neutral-700/50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-1">
              {t('community.newsletter.title', 'Mantente actualizado')}
            </h4>
            <p className="text-gray-400 text-sm">
              {t('community.newsletter.description', 'Recibe las últimas noticias y actualizaciones de GameGoUp')}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder={t('community.newsletter.emailPlaceholder', 'tu@email.com')}
              className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={() => {
                // En una implementación real, esto manejaría la suscripción
                console.log('Suscribirse al newsletter');
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              {t('community.newsletter.subscribe', 'Suscribirse')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
