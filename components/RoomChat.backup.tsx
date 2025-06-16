'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useChatManager } from './ChatManager'

// Tipos para el chat - SIMPLIFICADOS
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

  // Cargar datos iniciales
  useEffect(() => {
    if (initialized) return

    const initializeRoom = async () => {
      try {
        // Obtener usuario actual
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

        // Cargar información de la sala
        await loadRoomInfo()

        // Unirse a la sala
        await joinRoom(user.id)

        // Cargar mensajes y usuarios
        await loadMessages()
        await loadRoomUsers()

        setInitialized(true)
        setLoading(false)
      } catch (err) {
        console.error('Error inicializando sala:', err)
        setError(
          'Error al cargar la sala. Por favor verifica que la sala existe.'
        )
        setLoading(false)
      }
    }

    initializeRoom()
  }, [roomId, initialized])

  // Auto-scroll a mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Función para cargar información de la sala
  const loadRoomInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (error) {
        console.error('Error cargando sala:', error)
        throw new Error(
          'Sala no encontrada. Puede que haya sido eliminada o no exista.'
        )
      }

      setRoom(data)
    } catch (error) {
      console.error('Error en loadRoomInfo:', error)
      throw error
    }
  } // Función para cargar mensajes - SINTAXIS DIRECTA SIN JOIN
  const loadMessages = async () => {
    console.log('🔄 Cargando mensajes...')

    try {
      // Cargar mensajes básicos primero
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

      // Enriquecer cada mensaje con datos de perfil usando consultas individuales
      const enrichedMessages = []
      for (const message of messages) {
        try {
          // Consulta individual para cada usuario - BUSCAR POR ID Y USER_ID
          let profile = null

          // Intentar primero por user_id
          const { data: profileByUserId } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', message.user_id)
            .single()

          // Si no encuentra, intentar por id
          if (!profileByUserId) {
            const { data: profileById } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', message.user_id)
              .single()
            profile = profileById
          } else {
            profile = profileByUserId
          }

          enrichedMessages.push({
            ...message,
            username:
              profile?.username || `Usuario ${message.user_id.slice(-8)}`,
            avatar_url: profile?.avatar_url || '/logo.png',
          })
        } catch (profileError) {
          // Si falla la consulta del perfil, usar datos por defecto
          enrichedMessages.push({
            ...message,
            username: `Usuario ${message.user_id.slice(-8)}`,
            avatar_url: '/logo.png',
          })
        }
      }

      console.log('✅ Mensajes enriquecidos:', enrichedMessages.length)
      setMessages(enrichedMessages)
    } catch (err) {
      console.error('❌ Error cargando mensajes:', err)
      setMessages([])
    }
  }

  // Función para cargar usuarios - SINTAXIS DIRECTA SIN JOIN
  const loadRoomUsers = async () => {
    console.log('🔄 Cargando usuarios de la sala...')

    try {
      // Cargar usuarios básicos primero
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

      // Enriquecer cada usuario con datos de perfil usando consultas individuales
      const enrichedUsers = []
      for (const user of users) {
        try {
          // Consulta individual para cada usuario - BUSCAR POR ID Y USER_ID
          let profile = null

          // Intentar primero por user_id
          const { data: profileByUserId } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', user.user_id)
            .single()

          // Si no encuentra, intentar por id
          if (!profileByUserId) {
            const { data: profileById } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', user.user_id)
              .single()
            profile = profileById
          } else {
            profile = profileByUserId
          }

          enrichedUsers.push({
            ...user,
            username: profile?.username || `Usuario ${user.user_id.slice(-8)}`,
            avatar_url: profile?.avatar_url || '/logo.png',
          })
        } catch (profileError) {
          // Si falla la consulta del perfil, usar datos por defecto
          enrichedUsers.push({
            ...user,
            username: `Usuario ${user.user_id.slice(-8)}`,
            avatar_url: '/logo.png',
          })
        }
      }

      console.log('✅ Usuarios enriquecidos:', enrichedUsers.length)
      setRoomUsers(enrichedUsers)
    } catch (err) {
      console.error('❌ Error cargando usuarios:', err)
      setRoomUsers([])
    }
  }

  // Función para unirse a la sala
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

  // Función para enviar mensaje
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

  // Función SIMPLE para expulsar usuario
  const kickUser = async (userId: string, username: string) => {
    console.log('🚫 INICIO expulsión:', { userId, username, roomId })

    try {
      // Validación básica
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

      // Actualizar directamente en room_users
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
      // Recargar usuarios inmediatamente
      await loadRoomUsers()

      // Verificar si la sala quedó vacía y limpiarla si es necesario
      await checkAndCleanupRoom(roomId)

      alert(`✅ ${username} expulsado exitosamente`)
    } catch (err) {
      console.error('❌ Error:', err)
      alert('❌ Error inesperado')
    }
  }

  // Función para salir de la sala (cualquier usuario puede usarla)
  const leaveRoom = async () => {
    console.log('🚪 SALIR DE SALA:', { userId: user?.id, roomId })

    try {
      if (!user) {
        alert('❌ Error: No estás autenticado')
        return
      }

      if (!confirm('¿Estás seguro de que quieres salir de esta sala?')) {
        return
      }

      console.log('🔄 Marcándote como inactivo en la sala...')

      // Marcar al usuario como inactivo (salir de la sala)
      const { error } = await supabase
        .from('room_users')
        .update({ is_active: false })
        .eq('room_id', roomId)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Error al salir de la sala:', error)
        alert(`❌ Error: ${error.message}`)
        return
      }

      console.log('✅ Has salido de la sala exitosamente')
      // Agregar mensaje al chat informando que el usuario salió
      await supabase.from('chat_messages').insert({
        room_id: roomId,
        user_id: user.id,
        content: `👋 Ha salido de la sala`,
      })

      console.log('✅ Has salido de la sala exitosamente')

      // Verificar si la sala quedó vacía y limpiarla si es necesario
      await checkAndCleanupRoom(roomId)

      alert('✅ Has salido de la sala exitosamente')

      // Redirigir a la lista de salas
      router.push('/rooms')
    } catch (err) {
      console.error('❌ Error:', err)
      alert('❌ Error inesperado al salir de la sala')
    }
  }

  // Función para verificar y eliminar sala si está vacía
  const checkAndCleanupRoom = async (roomId: string) => {
    try {
      console.log('🧹 Verificando si la sala está vacía para limpiarla...')

      // Verificar si hay usuarios activos en la sala
      const { data: activeUsers, error: usersError } = await supabase
        .from('room_users')
        .select('user_id')
        .eq('room_id', roomId)
        .eq('is_active', true)

      if (usersError) {
        console.error('❌ Error verificando usuarios activos:', usersError)
        return
      }

      // Si no hay usuarios activos, eliminar la sala
      if (!activeUsers || activeUsers.length === 0) {
        console.log('🗑️ Sala vacía detectada, eliminando...')

        // Eliminar mensajes del chat
        await supabase.from('chat_messages').delete().eq('room_id', roomId)

        // Eliminar registros de usuarios de la sala
        await supabase.from('room_users').delete().eq('room_id', roomId)

        // Eliminar la sala
        const { error: deleteError } = await supabase
          .from('rooms')
          .delete()
          .eq('id', roomId)

        if (deleteError) {
          console.error('❌ Error eliminando sala:', deleteError)
        } else {
          console.log('✅ Sala eliminada exitosamente por estar vacía')
        }
      } else {
        console.log(
          `✅ Sala tiene ${activeUsers.length} usuarios activos, no se elimina`
        )
      }
    } catch (err) {
      console.error('❌ Error en verificación de sala vacía:', err)
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
      {' '}
      {/* Header */}
      <div className="bg-violet-800 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{room?.nombre}</h1>
          <p className="text-violet-200">🎮 {room?.juego}</p>
        </div>
        <div className="flex gap-3">
          {/* Botón para salir de la sala */}
          <button
            onClick={leaveRoom}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            title="Salir de la sala"
          >
            🚪 Salir de Sala
          </button>

          {/* Botón para volver a lista general */}
          <button
            onClick={() => router.push('/rooms')}
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg"
          >
            ← Volver a Lista
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Chat principal */}
        <div className="lg:col-span-3">
          <div className="bg-neutral-800 rounded-xl h-[600px] flex flex-col">
            {/* Mensajes */}
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
                        {message.username || message.user_id?.slice(-8) || 'Usuario'}
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

            {/* Input de mensaje */}
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

        {/* Sidebar - Usuarios */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-800 rounded-xl h-[600px] flex flex-col">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="text-lg font-semibold text-violet-300">
                Usuarios ({roomUsers.length})
              </h3>{' '}
              {user && room && user.id === room.creador_id && (
                <p className="text-yellow-300 text-sm mt-1">
                  👑 Eres el creador - Puedes expulsar usuarios
                </p>
              )}
              {/* Botón de salir de la sala - en sidebar */}
              <button
                onClick={leaveRoom}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-2 rounded-lg mt-2 transition-colors flex items-center justify-center gap-2"
                title="Salir de esta sala"
              >
                🚪 Abandonar Sala
              </button>
              {/* DEBUG INFO */}
              <div className="text-xs text-gray-400 mt-2 border border-gray-600 p-2 rounded">
                <p>🔧 DEBUG:</p>
                <p>Tu ID: {user?.id?.slice(-8) || 'No auth'}</p>
                <p>Creador ID: {room?.creador_id?.slice(-8) || 'No room'}</p>
                <p>
                  ¿Eres creador?:{' '}
                  {user?.id === room?.creador_id ? '✅ SÍ' : '❌ NO'}
                </p>{' '}
                <button
                  onClick={async () => {
                    console.log('🔄 Recargando usuarios manualmente...')
                    await loadRoomUsers()

                    // DEBUG: Verificar qué perfiles existen
                    console.log(
                      '🔍 DEBUG: Verificando perfiles en base de datos...'
                    )
                    const { data: allProfiles, error: profilesError } =
                      await supabase
                        .from('profiles')
                        .select('id, user_id, username, avatar_url')
                        .limit(10)

                    console.log('📊 Perfiles encontrados:', allProfiles)
                    if (profilesError)
                      console.error('❌ Error perfiles:', profilesError)

                    // DEBUG: Verificar usuarios en la sala
                    const { data: allRoomUsers, error: usersError } =
                      await supabase
                        .from('room_users')
                        .select('user_id, is_active')
                        .eq('room_id', roomId)

                    console.log('👥 Usuarios en sala:', allRoomUsers)
                    if (usersError)
                      console.error('❌ Error usuarios:', usersError)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded mt-1"
                >
                  🔄 Debug Completo
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {roomUsers.length === 0 ? (
                <p className="text-gray-400 text-center">
                  No hay usuarios activos
                </p>
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
                        {roomUser.username || roomUser.user_id?.slice(-8) || 'Usuario'}
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

                      {/* Botón de expulsar */}
                      {user &&
                        room &&
                        user.id === room.creador_id &&
                        roomUser.user_id !== user.id && (
                          <button
                            onClick={() =>
                              kickUser(
                                roomUser.user_id,
                                roomUser.username || 'Usuario'
                              )
                            }
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
