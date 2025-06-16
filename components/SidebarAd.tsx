'use client'

import AdManager from './AdManager'
import { getAdConfig } from '../lib/adConfig'

interface SidebarAdProps {
  className?: string
}

export default function SidebarAd({ className = '' }: SidebarAdProps) {
  const adConfig = getAdConfig('sidebar')

  return (
    <AdManager
      variant="sidebar"
      adSlot={adConfig.slot}
      className={className}
      fallbackAd={adConfig.fallback}
    />
  )
}
