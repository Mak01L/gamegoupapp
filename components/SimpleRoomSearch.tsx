'use client'

// Versión simplificada de RoomSearch para diagnosticar el problema
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface Room {
  id: string
  nombre: string
  juego: string
  regiones: string[]
  idiomas: string[]
  paises: string[]
  sistemas: string[]
  min_jugadores?: number
  max_jugadores?: number
  creador_id: string
  created_at: string
}

export default function SimpleRoomSearch() {
  const { t } = useTranslation(['rooms', 'common'])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  // Cargar todas las salas sin filtros por ahora
  const fetchRooms = async () => {
    try {
      console.log('🔍 Cargando salas...')
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      console.log('📊 Resultado:', { data, error })
      
      if (error) {
        console.error('❌ Error:', error)
        setError(`Error al cargar salas: ${error.message}`)
      } else {
        setRooms(data || [])
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err)
      setError('Error inesperado al cargar las salas')
    }
    setLoading(false)
  }
  useEffect(() => {
    fetchRooms()
    
    // Configurar suscripción realtime para nuevas salas
    const channel = supabase
      .channel('rooms_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        (payload) => {
          console.log('🔄 Cambio en salas detectado:', payload)
          // Recargar salas cuando hay cambios
          fetchRooms()
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  if (loading) {
    return <div className="text-white text-center">{t('rooms.loading')}</div>
  }

  if (error) {
    return <div className="text-red-400 text-center">{error}</div>
  }
  return (
    <div className="p-4 text-white max-w-4xl mx-auto">      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">🔍 {t('rooms.availableRooms')}</h2>
        <button
          onClick={() => {
            setLoading(true)
            fetchRooms()
          }}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm"
          disabled={loading}
        >
          🔄 {t('common.refresh')}
        </button>
      </div>
      
      <div className="grid gap-4">        {rooms.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {t('rooms.noRoomsAvailable')}
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="p-4 bg-violet-800/20 border border-violet-500 rounded-xl">
              <div className="text-lg font-bold text-violet-300 mb-2">
                {room.nombre}
              </div>
              
              <div className="text-sm text-gray-300 space-y-1 mb-3">
                <p>🎮 <span className="text-white">{room.juego}</span></p>
                <p>🌍 {room.regiones?.join(', ')}</p>
                <p>🗣️ {room.idiomas?.join(', ')}</p>
                <p>💻 {room.sistemas?.join(', ')}</p>
                <p>🏳️ {room.paises?.join(', ')}</p>                {room.min_jugadores && room.max_jugadores && (
                  <p>👥 {t('rooms.card.playersCount', { min: room.min_jugadores, max: room.max_jugadores })}</p>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mb-3">
                {t('rooms.createdOn')}: {new Date(room.created_at).toLocaleDateString()}
              </div>
              
              <button
                onClick={() => router.push(`/room/${room.id}`)}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
              >
                🚪 {t('rooms.card.enterRoom')}
              </button>
            </div>
          ))
        )}
      </div>
        <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/rooms/create')}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition-colors font-medium"
        >
          ➕ {t('rooms.createNewRoom')}
        </button>
      </div>
    </div>
  )
}
