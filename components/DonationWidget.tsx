"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DonationWidgetProps {
  className?: string;
  variant?: 'button' | 'card' | 'minimal';
}

export default function DonationWidget({ className = '', variant = 'card' }: DonationWidgetProps) {
  const { t } = useTranslation('common');
  const [showThanks, setShowThanks] = useState(false);
  const handleDonationClick = () => {
    // Mostrar mensaje de agradecimiento
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 3000);
    
    // Abrir URL de PayPal en nueva ventana
    window.open('https://www.paypal.com/donate/?hosted_button_id=RH23HZUUGEGVN', '_blank', 'noopener,noreferrer');
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleDonationClick}        className={`bg-pink-600 hover:bg-pink-700 rounded-xl p-4 text-center transition-colors group ${className}`}
      >
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform donation-heart">❤️</div>
        <div className="font-semibold">{t('dashboard.quickActions.supportUs')}</div>
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`text-center py-2 ${className}`}>
        <button
          onClick={handleDonationClick}
          className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
        >
          {showThanks ? t('dashboard.support.donation.thankyou') : t('dashboard.support.donation.button')}
        </button>
      </div>
    );
  }

  // variant === 'card'
  return (
    <div className={`bg-gradient-to-r from-pink-900/20 to-violet-900/20 border border-pink-700/50 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">❤️</div>
        <div>
          <h3 className="text-pink-400 font-semibold text-sm">{t('dashboard.support.donation.title')}</h3>
          <p className="text-gray-400 text-xs">{t('dashboard.support.donation.description')}</p>
        </div>
      </div>
      <button
        onClick={handleDonationClick}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        {showThanks ? t('dashboard.support.donation.thankyou') : t('dashboard.support.donation.button')}
      </button>
    </div>
  );
}
