"use client";

import { useTranslation } from 'react-i18next';

interface PlatformStatsProps {
  className?: string;
}

// Componente ahora solo muestra mensaje de desarrolladores sin estadísticas falsas
export default function PlatformStats({ className = '' }: PlatformStatsProps) {
  const { t } = useTranslation('common');

  return (
    <div className={`bg-neutral-900 border border-violet-700 rounded-xl p-6 ${className}`}>
      {/* Developer message */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-violet-400 mb-4">
          {t('platform.message.title', 'GameGoUp')}
        </h3>
        <p className="text-gray-300 mb-4">
          {t('platform.message.description', 'Conecta con gamers de todo el mundo y encuentra tu squad perfecto')}
        </p>
        <div className="border-t border-neutral-700 pt-4">
          <p className="text-xs text-gray-500 mb-2">
            {t('platform.stats.poweredBy', 'Desarrollado con')} ❤️ {t('platform.stats.forGamers', 'para gamers')}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <span>Next.js</span>
            <span>•</span>
            <span>Supabase</span>
            <span>•</span>
            <span>Tailwind</span>
          </div>
        </div>
      </div>
    </div>
  );
}
