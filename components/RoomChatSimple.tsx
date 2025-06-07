'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'
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

interface RoomChatSimpleProps {
  roomId: string
}

export default function RoomChatSimple({ roomId }: RoomChatSimpleProps) {
  const { t } = useTranslation('common')
  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [setupComplete, setSetupComplete] = useState(false)
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
        
        // Verificar si las tablas de chat existen
        await checkChatTablesSetup()
        
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

  const checkChatTablesSetup = async () => {
    try {
      // Intentar hacer una consulta simple a las tablas de chat
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1)

      if (!error) {
        setSetupComplete(true)
      }
    } catch (err) {
      console.log('Las tablas de chat aún no están configuradas')
      setSetupComplete(false)
    }
  }

  const handleLeaveRoom = () => {
    router.push('/rooms')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl">{t('loading.room')}</div>
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
        <div className="text-white text-xl">Sala no encontrada</div>
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
              title={t('leaveRoom')}
            >
              🚪 {t('leaveRoomShort')}
            </button>
          </div>

          {/* Filtros de la sala */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-300">🌍 Regiones:</span>
              <p className="text-white">{room.regiones?.join(', ') || 'Todas'}</p>
            </div>
            <div>
              <span className="text-gray-300">🗣️ Idiomas:</span>
              <p className="text-white">{room.idiomas?.join(', ') || 'Todos'}</p>
            </div>
            <div>
              <span className="text-gray-300">🏳️ Países:</span>
              <p className="text-white">{room.paises?.join(', ') || 'Todos'}</p>
            </div>
            <div>
              <span className="text-gray-300">💻 Sistemas:</span>
              <p className="text-white">{room.sistemas?.join(', ') || 'Todos'}</p>
            </div>
          </div>

          {room.min_jugadores && room.max_jugadores && (
            <div className="mt-2">
              <span className="text-gray-300">👥 Jugadores:</span>
              <span className="text-white ml-2">{room.min_jugadores}-{room.max_jugadores}</span>
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Área del chat */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-900/50 border border-violet-500 rounded-xl h-[600px] flex flex-col items-center justify-center">
              {!setupComplete ? (
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🔧</div>
                  <h2 className="text-2xl font-bold text-violet-300 mb-4">
                    Configuración Pendiente
                  </h2>
                  <p className="text-gray-300 mb-6 max-w-md">
                    Las tablas de chat en tiempo real necesitan ser configuradas. 
                    Por favor, ejecuta el script SQL en Supabase Dashboard.
                  </p>
                  <div className="bg-neutral-800 p-4 rounded-lg text-left">
                    <p className="text-sm text-gray-400 mb-2">Pasos a seguir:</p>
                    <ol className="text-sm text-white space-y-1">
                      <li>1. Ve a Supabase Dashboard</li>
                      <li>2. Abre el SQL Editor</li>
                      <li>3. Ejecuta el archivo: supabase-chat-setup.sql</li>
                      <li>4. Recarga esta página</li>
                    </ol>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    🔄 Verificar Setup
                  </button>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold text-violet-300 mb-4">
                    Chat en Tiempo Real
                  </h2>
                  <p className="text-gray-300">
                    El chat estará disponible una vez que se complete la configuración.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Información */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/50 border border-violet-500 rounded-xl h-[600px] flex flex-col">
              <div className="p-4 border-b border-violet-500">
                <h3 className="text-lg font-semibold text-violet-300">
                  📋 Información de la Sala
                </h3>
              </div>
              
              <div className="flex-1 p-4 space-y-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-violet-300 font-medium mb-2">🏷️ Detalles</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Creada:</span></p>
                    <p className="text-white">{new Date(room.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-violet-300 font-medium mb-2">⚙️ Configuración</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>📡 Chat en tiempo real</p>
                    <p>👥 Lista de usuarios activos</p>
                    <p>🔐 Mensajes privados</p>
                    <p>📤 Notificaciones</p>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-violet-300 font-medium mb-2">📊 Estado</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${setupComplete ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-white">
                        {setupComplete ? 'Chat Activo' : 'Setup Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
