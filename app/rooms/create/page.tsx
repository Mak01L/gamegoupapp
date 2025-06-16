// app/rooms/create/page.tsx
'use client'
import RoomCreator from '../../../components/RoomCreator'
import AdWidget from '../../../components/AdWidget'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function CreateRoomPage() {
  const router = useRouter()
  const { t } = useTranslation('common')

  const handleRoomCreated = (roomId?: string) => {
    if (roomId) {
      // Auto-redirigir a la sala creada
      console.log('🎯 Redirigiendo a la sala creada:', roomId)
      router.push(`/room/${roomId}`)
    } else {
      // Fallback: redirigir a la lista de salas
      router.push('/rooms')
    }
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-black"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header with back button */}
            <div className="flex flex-wrap items-center gap-3 p-4">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#292929] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#353535] transition-colors"
                onClick={() => router.back()}
              >
                <span className="truncate">
                  ← {t('navigation.backToRoomSearch')}
                </span>
              </button>
            </div>

            {/* Room Creator Component */}
            <div className="flex justify-center px-4">
              <RoomCreator onRoomCreated={handleRoomCreated} />
            </div>

            {/* Publicidad después de crear sala */}
            <div className="flex justify-center px-4 mt-8">
              <AdWidget variant="banner" className="max-w-[728px] w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
