// app/profile/page.tsx
'use client'

import ProfileCard from '../../components/ProfileCard'
import AdWidget from '../../components/AdWidget'
import { useTranslation } from 'react-i18next'

export default function ProfilePage() {
  const { t } = useTranslation('profile')

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-black"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header Section */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <h1 className="text-[#FFFFFF] tracking-light text-[32px] font-bold leading-tight">
                  👤 {t('title')}
                </h1>
                <p className="text-[#ABABAB] text-base font-normal leading-normal">
                  Gestiona tu perfil y configuración de cuenta
                </p>
              </div>
            </div>

            {/* Profile Card Component */}
            <div className="flex justify-center px-4">
              <ProfileCard />
            </div>

            {/* Publicidad en perfil */}
            <div className="flex justify-center px-4 mt-8">
              <AdWidget variant="banner" className="max-w-[728px] w-full" />
            </div>

            {/* Publicidad lateral */}
            <div className="flex justify-center px-4 mt-4">
              <AdWidget variant="card" className="max-w-[320px] w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
