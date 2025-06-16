'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface DonationWidgetProps {
  className?: string
  variant?: 'button' | 'card' | 'minimal'
}

export default function DonationWidget({
  className = '',
  variant = 'card',
}: DonationWidgetProps) {
  const { t } = useTranslation('common')
  const [showThanks, setShowThanks] = useState(false)
  const handleDonationClick = () => {
    // Mostrar mensaje de agradecimiento
    setShowThanks(true)
    setTimeout(() => setShowThanks(false), 3000)

    // Abrir URL de PayPal en nueva ventana
    window.open(
      'https://www.paypal.com/donate/?hosted_button_id=RH23HZUUGEGVN',
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleDonationClick}
        className={`bg-pink-600 hover:bg-pink-700 rounded-xl p-4 text-center transition-all duration-200 group transform hover:scale-105 ${className}`}
      >
        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
          ❤️
        </div>
        <div className="font-bold text-white">
          Apoyar GameGoUp
        </div>
        <div className="text-xs text-pink-100 mt-1">
          Donar con PayPal
        </div>
      </button>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={`text-center py-2 ${className}`}>
        <button
          onClick={handleDonationClick}
          className="text-pink-400 hover:text-pink-300 text-sm transition-colors font-medium"
        >
          {showThanks ? '¡Gracias por tu apoyo! ❤️' : '❤️ Donar'}
        </button>
      </div>
    )
  }

  // variant === 'card'
  return (
    <div
      className={`bg-gradient-to-r from-pink-900/30 to-red-900/30 border-2 border-pink-500/40 rounded-2xl p-6 backdrop-blur-sm hover:bg-pink-900/40 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl animate-pulse">❤️</div>
        <div>
          <h3 className="text-pink-200 font-bold text-lg">
            Apoya a GameGoUp
          </h3>
          <p className="text-gray-200 text-sm leading-relaxed">
            Ayúdanos a mantener la plataforma gratuita y mejorar la experiencia para todos los gamers
          </p>
        </div>
      </div>
      <button
        onClick={handleDonationClick}
        className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        {showThanks
          ? '¡Gracias por tu generosidad! ❤️'
          : '💖 Donar con PayPal'}
      </button>
      <div className="text-center mt-2">
        <span className="text-xs text-pink-300">
          100% seguro • Procesado por PayPal
        </span>
      </div>
    </div>
  )
}
