// Configuración de AdSense para GameGoUp
// Reemplazar con tus slot IDs reales de Google AdSense

export const ADSENSE_CONFIG = {
  // Tu Publisher ID de AdSense
  publisherId: 'ca-pub-7274762890410296',
  
  // Slots para diferentes tipos de anuncios - PENDING_VERIFICATION hasta que Google apruebe el sitio
  slots: {
    sidebar: 'PENDING_VERIFICATION',
    banner: 'PENDING_VERIFICATION', 
    cardMain: 'PENDING_VERIFICATION',
    cardSecondary: 'PENDING_VERIFICATION',
    footer: 'PENDING_VERIFICATION'
  },
  
  // Configuración de fallback para anuncios propios
  fallbackAds: {
    sidebar: {
      title: 'GameGoUp Pro',
      description: 'Funciones premium para gamers',
      sponsor: 'GameGoUp',
      link: '#'
    },
    banner: {
      title: 'Únete a nuestra comunidad Discord',
      description: 'Conecta con miles de gamers y encuentra compañeros de juego',
      sponsor: 'GameGoUp Community',
      link: '#'
    },
    gaming: {
      title: 'Auriculares Gaming Pro',
      description: 'Audio inmersivo para gaming competitivo',
      sponsor: 'AudioTech',
      link: '#'
    },
    tech: {
      title: 'Servidor VPS Gaming',
      description: 'Hosting optimizado para servidores de juegos',
      sponsor: 'CloudGaming',
      link: '#'
    }
  }
};

// URLs importantes
export const DONATION_CONFIG = {
  paypalUrl: 'https://www.paypal.com/donate/?hosted_button_id=RH23HZUUGEGVN'
};

// Función helper para obtener configuración de anuncio
export function getAdConfig(type: 'sidebar' | 'banner' | 'gaming' | 'tech') {
  return {
    slot: ADSENSE_CONFIG.slots[type === 'gaming' ? 'cardMain' : type === 'tech' ? 'cardSecondary' : type],
    fallback: ADSENSE_CONFIG.fallbackAds[type]
  };
}
