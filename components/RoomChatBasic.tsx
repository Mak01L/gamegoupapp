'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

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

interface RoomChatProps {
  roomId: string
}

export default function RoomChatBasic({ roomId }: RoomChatProps) {
  const { t } = useTranslation(['chat', 'common'])
  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setUser(user)

        if (!user) {
          router.push('/auth')
          return
        }

        // Cargar información de la sala
        await loadRoomInfo()
        
        setLoading(false)
      } catch (err) {
        console.error('Error inicializando sala:', err)
        setError('Error al cargar la sala')
        setLoading(false)
      }
    }

    initializeRoom()
  }, [roomId])

  const loadRoomInfo = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) throw error
    setRoom(data)
  }

  const handleLeaveRoom = () => {
    router.push('/rooms')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">{t('roomChat.loadingRoom')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">{t('roomChat.roomNotFound')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header de la sala */}
        <div className="bg-violet-800/20 border border-violet-500 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-violet-300 mb-2">{room.nombre}</h1>
              <p className="text-lg text-white">🎮 {room.juego}</p>
            </div>            <button
              onClick={handleLeaveRoom}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm flex items-center gap-2 hover:scale-105"
              title={t('roomChat.leaveRoom')}
            >
              🚪 {t('roomChat.leaveRoomShort')}
            </button>
          </div>

          {/* Filtros de la sala */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-300">🌍 {t('roomChat.regions')}:</span>
              <p className="text-white">{room.regiones?.join(', ') || t('roomChat.all')}</p>
            </div>
            <div>
              <span className="text-gray-300">🗣️ {t('roomChat.languages')}:</span>
              <p className="text-white">{room.idiomas?.join(', ') || t('roomChat.all')}</p>
            </div>
            <div>
              <span className="text-gray-300">🏳️ {t('roomChat.countries')}:</span>
              <p className="text-white">{room.paises?.join(', ') || t('roomChat.all')}</p>
            </div>
            <div>
              <span className="text-gray-300">💻 {t('roomChat.systems')}:</span>
              <p className="text-white">{room.sistemas?.join(', ') || t('roomChat.all')}</p>
            </div>
          </div>

          {room.min_jugadores && room.max_jugadores && (
            <div className="mt-2">
              <span className="text-gray-300">👥 {t('roomChat.players')}:</span>
              <span className="text-white ml-2">{room.min_jugadores}-{room.max_jugadores}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Área de chat temporal */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-900/50 border border-violet-500 rounded-xl h-[600px] flex flex-col">
              <div className="p-4 border-b border-violet-500">
                <h2 className="text-xl font-semibold text-violet-300">💬 {t('roomChat.roomChat')}</h2>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl mb-2">{t('roomChat.chatInDevelopment')}</h3>
                  <p className="text-sm max-w-md">
                    {t('roomChat.realTimeChatActivation')}
                    <br />
                    <strong>{t('roomChat.executeSupabaseScript')}</strong>
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-violet-500">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={t('roomChat.chatComingSoon')}
                    className="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
                    disabled
                  />
                  <button
                    className="bg-violet-600 text-white px-6 py-2 rounded-lg opacity-50 cursor-not-allowed"
                    disabled
                  >
                    {t('roomChat.send')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar temporal */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/50 border border-violet-500 rounded-xl h-[600px] flex flex-col">
              <div className="p-4 border-b border-violet-500">
                <h3 className="text-lg font-semibold text-violet-300">
                  👥 {t('roomChat.usersInRoom')}
                </h3>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-sm">
                    {t('roomChat.userListComingSoon')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones para configurar la base de datos */}
        <div className="mt-6 bg-yellow-900/20 border border-yellow-500 rounded-xl p-4">
          <h3 className="text-yellow-300 font-semibold mb-2">🔧 {t('roomChat.requiredConfiguration')}</h3>
          <p className="text-yellow-100 text-sm mb-2">
            {t('roomChat.activateRealTimeChat')}
            <code className="bg-yellow-800/30 px-1 rounded">supabase-chat-setup.sql</code> 
            {t('roomChat.inSupabaseSQLEditor')}
          </p>
          <div className="text-xs text-yellow-200">
            1. {t('roomChat.goToSupabaseDashboard')}<br/>
            2. {t('roomChat.selectYourProject')}<br/>
            3. {t('roomChat.goToSQL')}<br/>
            4. {t('roomChat.copyAndPasteScript')}<br/>
            5. {t('roomChat.executeScript')}
          </div>
        </div>
      </div>
    </div>
  )
}
