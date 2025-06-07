// app/rooms/create/page.tsx
'use client'
import RoomCreator from '../../../components/RoomCreator'
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
    <main className="min-h-screen flex flex-col items-center justify-center">
      <button
        className="mb-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-violet-300"
        onClick={() => router.back()}
      >
        ← {t('navigation.backToRoomSearch')}
      </button>
      <RoomCreator onRoomCreated={handleRoomCreated} />
    </main>
  )
}
