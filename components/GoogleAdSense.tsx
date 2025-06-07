"use client";

import { useEffect } from 'react';
import { ADSENSE_CONFIG } from '../lib/adConfig';

interface GoogleAdSenseProps {
  className?: string;
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function GoogleAdSense({ 
  className = '', 
  slot, 
  format = 'auto',
  responsive = true 
}: GoogleAdSenseProps) {
  useEffect(() => {
    try {
      // Inicializar AdSense cuando el componente se monta
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('Error loading AdSense:', error);
    }
  }, []);

  return (
    <div className={`google-adsense-container ${className}`}>      <ins
        className="adsbygoogle block"
        data-ad-client={ADSENSE_CONFIG.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
