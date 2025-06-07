'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

// Tipos para el chat
interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  content: string
  created_at: string
  username?: string
  avatar_url?: string
}

interface RoomUser {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  last_seen: string
  is_active: boolean
  username?: string
  avatar_url?: string
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
  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cargar datos iniciales solo una vez
  useEffect(() => {
    if (initialized) return

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
        
        // Unirse a la sala
        await joinRoom(user.id)
        
        // Cargar mensajes y usuarios
        await loadMessages()
        await loadRoomUsers()
        
        setInitialized(true)
        setLoading(false)
      } catch (err) {
        console.error('Error inicializando sala:', err)
        setError('Error al cargar la sala')
        setLoading(false)
      }
    }

    initializeRoom()

    // Cleanup al salir del componente
    return () => {
      if (user) {
        leaveRoom(user.id)
      }
    }
  }, [roomId, initialized])  // Configurar suscripciones en tiempo real en un useEffect separado
  useEffect(() => {
    if (!roomId || !initialized || loading) return

    let messagesChannel: any = null
    let usersChannel: any = null

    // Configurar suscripciones
    const setupSubscriptions = () => {
      // Suscripción a mensajes nuevos con ID único
      const messagesChannelId = `room_messages_${roomId}_${Math.random().toString(36).substr(2, 9)}`
      messagesChannel = supabase
        .channel(messagesChannelId)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          },
          async (payload) => {
            // Obtener el mensaje completo con información del usuario
            const { data } = await supabase
              .from('chat_messages_with_profiles')
              .select('*')
              .eq('id', payload.new.id)
              .single()

            if (data) {
              setMessages(prev => [...prev, data])
            }
          }
        )
        .subscribe()

      // Suscripción a usuarios en la sala con ID único
      const usersChannelId = `room_users_${roomId}_${Math.random().toString(36).substr(2, 9)}`
      usersChannel = supabase
        .channel(usersChannelId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'room_users',
            filter: `room_id=eq.${roomId}`
          },
          () => {
            loadRoomUsers() // Recargar lista de usuarios
          }
        )
        .subscribe()
    }

    setupSubscriptions()

    // Cleanup
    return () => {
      if (messagesChannel) {
        messagesChannel.unsubscribe()
      }
      if (usersChannel) {
        usersChannel.unsubscribe()
      }    }
  }, [roomId, initialized, loading])

  // Auto-scroll a mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadRoomInfo = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) throw error
    setRoom(data)
  }

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages_with_profiles')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) throw error
    setMessages(data || [])
  }

  const loadRoomUsers = async () => {
    const { data, error } = await supabase
      .from('active_room_users')
      .select('*')
      .eq('room_id', roomId)

    if (error) throw error
    setRoomUsers(data || [])
  }
  const joinRoom = async (userId: string) => {
    try {
      // Primero intentamos actualizar si ya existe
      const { data: existing, error: selectError } = await supabase
        .from('room_users')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .maybeSingle()

      if (existing) {
        // Si ya existe, solo actualizamos
        const { error: updateError } = await supabase
          .from('room_users')
          .update({
            is_active: true,
            last_seen: new Date().toISOString()
          })
          .eq('room_id', roomId)
          .eq('user_id', userId)

        if (updateError) throw updateError
      } else {        // Si no existe, insertamos nuevo
        const { error: insertError } = await supabase
          .from('room_users')
          .insert({
            room_id: roomId,
            user_id: userId,
            is_active: true,
            last_seen: new Date().toISOString()
          })
        
        if (insertError) throw insertError
      }
    } catch (err) {      console.error('Error al unirse a la sala:', err)
      // No lanzamos el error para que no pare la carga de la sala
    }
  }

  const leaveRoom = async (userId: string) => {
    try {
      // Marcar usuario como inactivo
      const { error } = await supabase
        .from('room_users')
        .update({ 
          is_active: false,
          last_seen: new Date().toISOString()
        })
        .eq('room_id', roomId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error al marcar usuario como inactivo:', error)
        return
      }

      // Verificar si la sala quedó vacía para eliminarla manualmente
      const { data: activeUsers, error: countError } = await supabase
        .from('room_users')
        .select('id')
        .eq('room_id', roomId)
        .eq('is_active', true)

      if (!countError && activeUsers && activeUsers.length === 0) {
        // Si no hay usuarios activos, eliminar la sala
        const { error: deleteError } = await supabase
          .from('rooms')
          .delete()
          .eq('id', roomId)

        if (deleteError) {
          console.error('Error al eliminar sala vacía:', deleteError)
        } else {
          console.log('Sala eliminada por estar vacía')
        }
      }
    } catch (err) {
      console.error('Error en leaveRoom:', err)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        content: newMessage.trim()
      })

    if (error) {
      console.error('Error enviando mensaje:', error)
      return
    }

    setNewMessage('')
  }  // Función para expulsar usuario (solo para creadores)
  const kickUser = async (userId: string, username: string) => {
    if (!user || !room || user.id !== room.creador_id) {
      console.error(t('chat.moderation.onlyCreatorCanKick'))
      return
    }

    if (userId === user.id) {
      console.error(t('chat.moderation.cannotKickSelf'))
      return
    }

    try {
      // Usar la función de PostgreSQL para expulsar usuario de forma segura
      const { data, error } = await supabase
        .rpc('kick_user_from_room', {
          room_id_param: roomId,
          creator_id_param: user.id,
          user_to_kick_id_param: userId
        })

      if (error) {
        console.error(t('chat.moderation.kickError'), error)
        return
      }

      if (data?.success) {
        console.log(t('chat.moderation.userKicked', { username }))
        // Recargar lista de usuarios
        await loadRoomUsers()
      } else {
        console.error(t('chat.moderation.kickError'), data?.error)
      }

    } catch (err) {
      console.error(t('chat.moderation.kickError'), err)
    }
  }

  const handleLeaveRoom = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Usar la función de PostgreSQL para salir de forma segura
      const { data, error } = await supabase
        .rpc('leave_room_safely', {
          room_id_param: roomId,
          user_id_param: user.id
        })

      if (error) {
        console.error('Error al salir de la sala:', error)
        // Fallback: marcar como inactivo manualmente
        await leaveRoom(user.id)
      } else {
        console.log('Resultado al salir:', data)
        // Mostrar mensaje si la sala fue eliminada
        if (data?.room_deleted) {
          console.log('Sala eliminada automáticamente por estar vacía')
        }
      }
      
    } catch (err) {
      console.error('Error inesperado al salir:', err)
      // Fallback: marcar como inactivo manualmente
      await leaveRoom(user.id)
    } finally {
      // Siempre redirigir al listado de salas
      router.push('/rooms')
    }
  }

  const updateLastSeen = async () => {
    if (!user) return
    
    await supabase
      .from('room_users')
      .update({ last_seen: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id)
  }

  // Actualizar last_seen cada 30 segundos
  useEffect(() => {
    const interval = setInterval(updateLastSeen, 30000)
    return () => clearInterval(interval)
  }, [user])
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">{t('chat.room.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">{t('chat.room.notFound')}</div>
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
              title={t('chat.room.leaveRoom')}
            >
              🚪 {t('chat.room.leaveRoomShort')}
            </button>
          </div>          {/* Filtros de la sala */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-300">🌍 {t('chat.room.regions')}:</span>
              <p className="text-white">{room.regiones?.join(', ') || t('common.all')}</p>
            </div>
            <div>
              <span className="text-gray-300">🗣️ {t('chat.room.languages')}:</span>
              <p className="text-white">{room.idiomas?.join(', ') || t('common.all')}</p>
            </div>
            <div>
              <span className="text-gray-300">🏳️ {t('chat.room.countries')}:</span>
              <p className="text-white">{room.paises?.join(', ') || t('common.all')}</p>
            </div>
            <div>
              <span className="text-gray-300">💻 {t('chat.room.systems')}:</span>
              <p className="text-white">{room.sistemas?.join(', ') || t('common.all')}</p>
            </div>
          </div>

          {room.min_jugadores && room.max_jugadores && (
            <div className="mt-2">
              <span className="text-gray-300">👥 {t('chat.room.players')}:</span>
              <span className="text-white ml-2">{room.min_jugadores}-{room.max_jugadores}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat principal */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-900/50 border border-violet-500 rounded-xl h-[600px] flex flex-col">              {/* Header del chat */}
              <div className="p-4 border-b border-violet-500">
                <h2 className="text-xl font-semibold text-violet-300">{t('chat.room.title')} 💬</h2>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start gap-3 max-w-[75%]`}>
                      {message.user_id !== user?.id && (
                        <img 
                          className="w-8 h-8 rounded-full object-cover" 
                          src={message.avatar_url || '/logo.png'} 
                          alt={message.username || 'Usuario'} 
                        />
                      )}
                      
                      <div className={`flex flex-col p-3 rounded-xl ${
                        message.user_id === user?.id 
                          ? 'bg-violet-600 rounded-tr-none' 
                          : 'bg-neutral-800 rounded-tl-none'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-semibold text-white">
                            {message.username || 'Usuario'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-white whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>

                      {message.user_id === user?.id && (
                        <img 
                          className="w-8 h-8 rounded-full object-cover" 
                          src={message.avatar_url || user?.user_metadata?.avatar_url || '/logo.png'} 
                          alt={message.username || 'Usuario'} 
                        />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input para enviar mensajes */}
              <form onSubmit={sendMessage} className="p-4 border-t border-violet-500">
                <div className="flex gap-3">                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('chat.room.messagePlaceholder')}
                    className="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                    disabled={!user}
                  />
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                    disabled={!user || !newMessage.trim()}
                  >
                    {t('chat:chat.send')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Usuarios en la sala */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/50 border border-violet-500 rounded-xl h-[600px] flex flex-col">              <div className="p-4 border-b border-violet-500">
                <h3 className="text-lg font-semibold text-violet-300">
                  {t('chat.room.usersInRoom')} ({roomUsers.length})
                </h3>
              </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {roomUsers.map((roomUser) => (
                  <div key={roomUser.id} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg group">
                    <img 
                      className="w-10 h-10 rounded-full object-cover" 
                      src={roomUser.avatar_url || '/logo.png'} 
                      alt={roomUser.username || 'Usuario'} 
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {roomUser.username || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {roomUser.user_id === room.creador_id && `👑 ${t('chat.room.creator')}`}
                        {roomUser.user_id === user?.id && ` (${t('chat.room.you')})`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      {/* Botón de expulsar (solo visible para el creador y no en sí mismo) */}
                      {user && room && user.id === room.creador_id && roomUser.user_id !== user.id && (
                        <button
                          onClick={() => kickUser(roomUser.user_id, roomUser.username || 'Usuario')}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs p-1 rounded transition-all duration-200 hover:bg-red-900/20"                          title={t('chat.actions.kickUser')}
                        >
                          🚫
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
