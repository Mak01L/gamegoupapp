'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useChatManager } from './ChatManager'

interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  content: string
  created_at: string
  username: string
  avatar_url: string
}

interface RoomUser {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  last_seen: string
  is_active: boolean
  username: string
  avatar_url: string
}

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

export default function RoomChat({ roomId }: RoomChatProps) {
  const { t } = useTranslation(['chat', 'common'])
  const {
    addRoom,
    setRoomActive,
    incrementUnreadMessages,
    clearUnreadMessages,
    setCurrentRoom,
  } = useChatManager()
  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (initialized) return

    const initializeRoom = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        setUser(user)

        if (!user) {
          router.push('/auth')
          return
        }

        await loadRoomInfo()
        await joinRoom(user.id)
        await loadMessages()
        await loadRoomUsers()

        setInitialized(true)
        setLoading(false)
      } catch (err) {
        console.error('Error inicializando sala:', err)
        setError('Error al cargar la sala. Por favor verifica que la sala existe.')
        setLoading(false)
      }
    }

    initializeRoom()
  }, [roomId, initialized])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getUserInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single()

      if (error || !data) {
        return {
          username: userId.slice(-8),
          avatar_url: '/logo.png',
        }
      }

      return {
        username: data.username || userId.slice(-8),
        avatar_url: data.avatar_url || '/logo.png',
      }
    } catch (err) {
      return {
        username: userId.slice(-8),
        avatar_url: '/logo.png',
      }
    }
  }

  const loadRoomInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (error) {
        console.error('Error cargando sala:', error)
        throw new Error('Sala no encontrada. Puede que haya sido eliminada o no exista.')
      }

      setRoom(data)
    } catch (error) {
      console.error('Error en loadRoomInfo:', error)
      throw error
    }
  }

  const loadMessages = async () => {
    console.log('🔄 Cargando mensajes...')

    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error

      if (!messages || messages.length === 0) {
        setMessages([])
        return
      }

      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const userInfo = await getUserInfo(message.user_id)
          return {
            ...message,
            username: userInfo.username,
            avatar_url: userInfo.avatar_url,
          }
        })
      )

      console.log('✅ Mensajes cargados con usuarios:', enrichedMessages.length)
      setMessages(enrichedMessages)
    } catch (err) {
      console.error('❌ Error cargando mensajes:', err)
      setMessages([])
    }
  }

  const loadRoomUsers = async () => {
    console.log('🔄 Cargando usuarios de la sala...')

    try {
      const { data: users, error } = await supabase
        .from('room_users')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true })

      if (error) throw error

      if (!users || users.length === 0) {
        setRoomUsers([])
        return
      }

      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          const userInfo = await getUserInfo(user.user_id)
          return {
            ...user,
            username: userInfo.username,
            avatar_url: userInfo.avatar_url,
          }
        })
      )

      console.log('✅ Usuarios cargados con perfiles:', enrichedUsers.length)
      setRoomUsers(enrichedUsers)
    } catch (err) {
      console.error('❌ Error cargando usuarios:', err)
      setRoomUsers([])
    }
  }

  const joinRoom = async (userId: string) => {
    try {
      const { data: existing, error: selectError } = await supabase
        .from('room_users')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .maybeSingle()

      if (selectError) throw selectError

      if (existing) {
        const { error: updateError } = await supabase
          .from('room_users')
          .update({
            is_active: true,
            last_seen: new Date().toISOString(),
          })
          .eq('room_id', roomId)
          .eq('user_id', userId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('room_users')
          .insert({
            room_id: roomId,
            user_id: userId,
            is_active: true,
            joined_at: new Date().toISOString(),
            last_seen: new Date().toISOString(),
          })

        if (insertError) throw insertError
      }
    } catch (error) {
      console.error('Error uniéndose a la sala:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const { error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      user_id: user.id,
      content: newMessage.trim(),
    })

    if (error) {
      console.error('Error enviando mensaje:', error)
      return
    }

    setNewMessage('')
  }

  const kickUser = async (userId: string, username: string) => {
    console.log('🚫 INICIO expulsión:', { userId, username, roomId })

    try {
      if (!user || !room) {
        alert('❌ Error: No se pudo obtener información del usuario o sala')
        return
      }

      if (user.id !== room.creador_id) {
        alert('❌ Solo el creador puede expulsar usuarios')
        return
      }

      if (userId === user.id) {
        alert('❌ No puedes expulsarte a ti mismo')
        return
      }

      if (!confirm(`¿Expulsar a ${username}?`)) {
        return
      }

      console.log('🔄 Marcando usuario como inactivo...')

      const { error } = await supabase
        .from('room_users')
        .update({ is_active: false })
        .eq('room_id', roomId)
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error en base de datos:', error)
        alert(`❌ Error: ${error.message}`)
        return
      }

      console.log('✅ Usuario marcado como inactivo')
      await loadRoomUsers()
      alert(`✅ ${username} expulsado exitosamente`)
    } catch (err) {
      console.error('❌ Error:', err)
      alert('❌ Error inesperado')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={() => router.push('/rooms')}
          className="mt-4 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg"
        >
          Volver a salas
        </button>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 text-white min-h-screen">
      <div className="bg-violet-800 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{room?.nombre}</h1>
          <p className="text-violet-200">🎮 {room?.juego}</p>
        </div>
        <button
          onClick={() => router.push('/rooms')}
          className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg"
        >
          ← Volver
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        <div className="lg:col-span-3">
          <div className="bg-neutral-800 rounded-xl h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={message.avatar_url || '/logo.png'}
                    alt={message.username || 'Usuario'}
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png'
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-violet-300">
                        {message.username || 'Usuario'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-200">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-neutral-700">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={!user}
                />
                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                  disabled={!user || !newMessage.trim()}
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-neutral-800 rounded-xl h-[600px] flex flex-col">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="text-lg font-semibold text-violet-300">
                Usuarios ({roomUsers.length})
              </h3>
              {user && room && user.id === room.creador_id && (
                <p className="text-yellow-300 text-sm mt-1">
                  👑 Eres el creador - Puedes expulsar usuarios
                </p>
              )}
              <div className="text-xs text-gray-400 mt-2 border border-gray-600 p-2 rounded">
                <p>🔧 DEBUG:</p>
                <p>Tu ID: {user?.id?.slice(-8) || 'No auth'}</p>
                <p>Creador ID: {room?.creador_id?.slice(-8) || 'No room'}</p>
                <p>
                  ¿Eres creador?: {user?.id === room?.creador_id ? '✅ SÍ' : '❌ NO'}
                </p>
                <button
                  onClick={() => {
                    console.log('🔄 Recargando usuarios manualmente...')
                    loadRoomUsers()
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded mt-1"
                >
                  🔄 Refrescar Lista
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {roomUsers.length === 0 ? (
                <p className="text-gray-400 text-center">No hay usuarios activos</p>
              ) : (
                roomUsers.map((roomUser) => (
                  <div
                    key={roomUser.user_id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-neutral-700"
                  >
                    <img
                      className="w-8 h-8 rounded-full object-cover"
                      src={roomUser.avatar_url || '/logo.png'}
                      alt={roomUser.username || 'Usuario'}
                      onError={(e) => {
                        e.currentTarget.src = '/logo.png'
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {roomUser.username || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {roomUser.user_id === room?.creador_id && '👑 Creador'}
                        {roomUser.user_id === user?.id && ' (Tú)'}
                        {roomUser.user_id !== room?.creador_id &&
                          roomUser.user_id !== user?.id &&
                          `ID: ${roomUser.user_id?.slice(-4)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      {user &&
                        room &&
                        user.id === room.creador_id &&
                        roomUser.user_id !== user.id && (
                          <button
                            onClick={() => kickUser(roomUser.user_id, roomUser.username || 'Usuario')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors"
                            title="Expulsar usuario"
                          >
                            🚫 Expulsar
                          </button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
