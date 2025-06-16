'use client'

import { useEffect, useRef } from 'react'
import { ADSENSE_CONFIG } from '../lib/adConfig'

interface GoogleAdSenseProps {
  className?: string
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function GoogleAdSense({
  className = '',
  slot,
  format = 'auto',
  responsive = true,
}: GoogleAdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      // Verificar que el slot no sea de prueba
      if (slot && slot !== 'PENDING_VERIFICATION' && slot !== '1234567890' && slot !== '2345678901' && slot !== '3456789012') {
        // Inicializar AdSense cuando el componente se monta
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({})
          console.log('AdSense ad initialized for slot:', slot)
        }
      } else {
        console.warn('AdSense slot is placeholder or invalid:', slot)
      }
    } catch (error) {
      console.error('Error loading AdSense:', error)
    }
  }, [slot])

  // Mostrar placeholder si el slot es de prueba
  if (!slot || slot === 'PENDING_VERIFICATION' || slot.includes('123456')) {
    return (
      <div className={`bg-neutral-800/40 border border-neutral-600/30 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-400 text-sm mb-2">
          📢 Espacio Publicitario
        </div>
        <div className="text-gray-500 text-xs">
          Aquí aparecerán anuncios de Google AdSense una vez configurado
        </div>
      </div>
    )
  }

  return (
    <div ref={adRef} className={`google-adsense-container ${className}`}>
      <ins
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CONFIG.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
