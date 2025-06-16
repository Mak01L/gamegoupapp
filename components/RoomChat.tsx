'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useChatManager } from './ChatManager'
import AdWidget from './AdWidget'

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
    incrementUnreadMessages,    clearUnreadMessages,
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
        setLoading(true)
        setError('')
        
        console.log('🔄 Inicializando sala:', roomId)
        
        // Intentar obtener usuario con mejor manejo de errores
        let currentUser: User | null = null
        
        try {
          // Primero intentar obtener sesión activa
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (session?.user) {
            currentUser = session.user
            console.log('✅ Usuario obtenido de sesión activa')
          } else {
            // Como alternativa, intentar getUser
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (user && !userError) {
              currentUser = user
              console.log('✅ Usuario obtenido con getUser')            } else {
              throw new Error('No hay sesión de usuario activa')
            }
          }
        } catch (authError) {
          console.warn('⚠️ Error de autenticación:', authError)
          
          // Como último recurso, crear usuario temporal para pruebas
          console.log('🔧 Intentando crear usuario temporal...')
          const tempUser = await createTemporaryUser()
          
          if (tempUser) {
            currentUser = tempUser
            console.log('✅ Usando usuario temporal para pruebas')
          } else {
            setError('No se pudo establecer sesión de usuario. Redirigiendo al login...')
            setTimeout(() => {
              router.push('/auth')
            }, 3000)
            setLoading(false)
            return
          }
        }

        if (!currentUser) {
          setError('No estás autenticado. Redirigiendo al login...')
          setTimeout(() => {
            router.push('/auth')
          }, 2000)
          setLoading(false)
          return
        }

        setUser(currentUser)
        console.log('👤 Usuario establecido:', currentUser.id.slice(-8))

        await loadRoomInfo()
        await joinRoom(currentUser.id)
        await loadMessages()
        await loadRoomUsers()

        setInitialized(true)
        setLoading(false)
        console.log('✅ Sala inicializada correctamente')
          } catch (err) {
        console.error('❌ Error inicializando sala:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(`Error al cargar la sala: ${errorMessage}`)
        setLoading(false)
      }
    }

    initializeRoom()
  }, [roomId, initialized])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Suscripción en tiempo real para mensajes
  useEffect(() => {
    if (!roomId) return

    console.log('🔔 Configurando suscripción de mensajes para sala:', roomId)

    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('🔔 Cambio en mensajes detectado:', payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('📥 Nuevo mensaje recibido, recargando...')
            loadMessages()
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔕 Limpiando suscripción de mensajes')
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const getUserInfo = async (userId: string) => {
    try {
      // Intentar obtener de profiles primero - USAR user_id no id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, real_name, email')
        .eq('user_id', userId)  // CAMBIO PRINCIPAL: usar user_id
        .single()

      if (profile && !profileError) {
        console.log('✅ Profile encontrado para', userId, ':', profile)
        const displayName = profile.username || 
                           profile.real_name || 
                           profile.email?.split('@')[0] || 
                           `Gamer-${userId.slice(-4)}`
        
        return {
          username: displayName,
          avatar_url: profile.avatar_url || '/logo.png',
        }
      }

      console.log('⚠️ No se encontró profile para:', userId, 'Error:', profileError)

      // Si es el usuario actual, crear profile desde metadata
      if (userId === user?.id && user?.user_metadata) {
        const metadata = user.user_metadata
        const realName = metadata.username || 
                        metadata.full_name || 
                        metadata.name || 
                        metadata.display_name ||
                        user.email?.split('@')[0] ||
                        `Gamer-${userId.slice(-4)}`
        
        console.log('✅ Usuario actual, creando profile con:', realName)
        
        // Crear profile completo en la base de datos
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,  // USAR user_id
              username: realName,
              email: user.email,
              avatar_url: metadata.avatar_url || '/logo.png',
              bio: '',
              real_name: metadata.full_name || metadata.name || '',
              privacy: { real_name: false, location: false, birthdate: false },
              preferences: { theme: 'dark', language: 'es', visibility: 'public' },
              stats: { games_played: 0, rooms_created: 0 }
            }, { onConflict: 'user_id' })

          if (!insertError) {
            console.log('✅ Profile creado exitosamente para:', realName)
          } else {
            console.error('❌ Error al crear profile:', insertError)
          }
          
          return {
            username: realName,
            avatar_url: metadata.avatar_url || '/logo.png',
          }
        } catch (insertErr) {
          console.error('❌ Error en upsert profile:', insertErr)
        }
      }

      // Fallback final
      console.log('⚠️ Usando fallback para:', userId)
      return {
        username: `Gamer-${userId.slice(-4)}`,
        avatar_url: '/logo.png',
      }
    } catch (err) {
      console.error('❌ Error obteniendo info de usuario:', err)
      return {
        username: `Gamer-${userId.slice(-4)}`,
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
      // Asegurar que el usuario tenga un profile antes de unirse
      await ensureUserProfile(userId)

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

    console.log('📤 Enviando mensaje:', newMessage.trim())

    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        user_id: user.id,
        content: newMessage.trim(),
      })

      if (error) {
        console.error('❌ Error enviando mensaje:', error)
        alert('Error al enviar mensaje')
        return
      }

      console.log('✅ Mensaje enviado exitosamente')
      setNewMessage('')
      
      // Recargar mensajes para mostrar el nuevo mensaje
      await loadMessages()
    } catch (err) {
      console.error('❌ Error inesperado enviando mensaje:', err)
      alert('Error inesperado al enviar mensaje')
    }
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

  const leaveRoom = async () => {
    try {
      if (!user) {
        alert('❌ Error: No se pudo obtener información del usuario')
        return
      }

      if (!confirm(`¿Salir de la sala "${room?.nombre}"?`)) {
        return
      }

      console.log('🚪 Saliendo de la sala...')

      const { error } = await supabase
        .from('room_users')
        .update({ is_active: false })
        .eq('room_id', roomId)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Error saliendo de la sala:', error)
        alert(`❌ Error: ${error.message}`)
        return
      }

      console.log('✅ Salido de la sala exitosamente')
      router.push('/rooms')
    } catch (err) {
      console.error('❌ Error:', err)
      alert('❌ Error inesperado')
    }
  }

  // Función para crear usuario temporal si no hay autenticación
  const createTemporaryUser = async () => {
    try {
      console.log('🔧 Creando usuario temporal para pruebas...')
      
      // Generar un ID temporal único
      const tempUserId = `temp-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Crear un objeto usuario temporal
      const tempUser = {
        id: tempUserId,
        email: `${tempUserId}@temp.local`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_metadata: { username: `Usuario${tempUserId.slice(-4)}` },
        app_metadata: {},
        aud: 'authenticated',
        role: 'authenticated'
      } as User
      
      console.log('✅ Usuario temporal creado:', tempUser.id.slice(-8))
      return tempUser
      
    } catch (error) {
      console.error('❌ Error creando usuario temporal:', error)
      return null
    }
  }
  // Función para asegurar que el usuario tenga un profile
  const ensureUserProfile = async (userId: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id, username')
        .eq('user_id', userId)  // USAR user_id
        .single()

      if (!existingProfile) {
        // Obtener información del usuario actual si es él mismo
        let username = `Gamer-${userId.slice(-4)}`
        let avatar_url = '/logo.png'

        if (userId === user?.id && user?.user_metadata) {
          const metadata = user.user_metadata
          username = metadata.username || 
                    metadata.full_name || 
                    metadata.name || 
                    metadata.display_name ||
                    user.email?.split('@')[0] ||
                    username
          avatar_url = metadata.avatar_url || avatar_url
        }

        // Crear el profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,  // USAR user_id
            username: username,
            email: userId === user?.id ? user.email : null,
            avatar_url: avatar_url,
            bio: '',
            real_name: '',
            privacy: { real_name: false, location: false, birthdate: false },
            preferences: { theme: 'dark', language: 'es', visibility: 'public' },
            stats: { games_played: 0, rooms_created: 0 }
          })

        if (!insertError) {
          console.log('✅ Profile creado para usuario:', userId, 'con nombre:', username)
        } else {
          console.error('❌ Error creando profile:', insertError)
        }
      }
    } catch (error) {
      console.error('❌ Error en ensureUserProfile:', error)
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
      <div className="bg-neutral-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center py-12 px-8 max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Error al cargar la sala</h2>
            <p className="text-gray-300 text-base leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => router.push('/rooms')}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-base"
          >
            ← Volver a salas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 text-white min-h-screen">      <div className="bg-violet-800 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{room?.nombre}</h1>
          <p className="text-violet-200">🎮 {room?.juego}</p>
        </div>        <div className="flex gap-3">
          <button
            onClick={leaveRoom}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            title="Salir de esta sala y volver a la lista"
          >
            🚪 Salir de la Sala
          </button>
          <button
            onClick={() => router.push('/rooms')}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            title="Volver a la lista de salas sin salir"
          >
            ← Volver a Salas
          </button>
        </div>
      </div>      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Chat principal */}
        <div className="lg:col-span-3 space-y-4">
          {/* Área del chat */}
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
          </div>          {/* Publicidad debajo del chat con Google AdSense */}
          <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
            <div className="text-center">
              <AdWidget 
                variant="banner" 
                className="w-full max-w-[728px] mx-auto" 
                useAdsense={true}
                type="adsense"
              />
            </div>
          </div>
        </div>

        {/* Sidebar de usuarios - SIN publicidad que interfiera */}
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
              )}              <div className="hidden text-xs text-gray-400 mt-2 border border-gray-600 p-2 rounded">{/* DEBUG SECTION - HIDDEN */}
                <p>🔧 DEBUG:</p>
                <p>Tu ID: {user?.id?.slice(-8) || 'No auth'}</p>
                <p>Creador ID: {room?.creador_id?.slice(-8) || 'No room'}</p>
                <p>
                  ¿Eres creador?: {user?.id === room?.creador_id ? '✅ SÍ' : '❌ NO'}
                </p>
                <div className="flex gap-2 mt-2">                  <button
                    onClick={() => {
                      console.log('🔄 Recargando usuarios manualmente...')
                      loadRoomUsers()
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                  >
                    🔄 Refrescar Lista
                  </button>
                  <button
                    onClick={async () => {
                      console.log('💬 Enviando mensaje de prueba...')
                      if (user) {
                        try {
                          const testMessage = `Mensaje de prueba - ${new Date().toLocaleTimeString()}`
                          const { data, error } = await supabase.from('chat_messages').insert({
                            room_id: roomId,
                            user_id: user.id,
                            content: testMessage,
                          }).select()
                          
                          if (error) {
                            console.error('❌ Error enviando mensaje de prueba:', error)
                            alert('❌ Error: ' + error.message)
                          } else {
                            console.log('✅ Mensaje de prueba enviado:', data)
                            alert('✅ Mensaje enviado! Recargando...')
                            await loadMessages()
                          }
                        } catch (err) {
                          console.error('❌ Error:', err)
                          alert('❌ Error: ' + err)
                        }
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded"
                  >
                    💬 Test Mensaje
                  </button><button
                    onClick={async () => {
                      // Generar un nombre aleatorio como sugerencia
                      const coolNames = [
                        'ShadowHunter', 'DragonSlayer', 'StormBreaker', 'CyberNinja', 'FireStrike',
                        'NightRider', 'ThunderBolt', 'PixelMaster', 'GameChanger', 'ElitePlayer',
                        'ProGamer', 'SkillShot', 'TopPlayer', 'WinStreak', 'LevelUp'
                      ]
                      const randomSuggestion = coolNames[Math.floor(Math.random() * coolNames.length)]
                      
                      const newName = prompt(
                        `Ingresa tu nuevo nombre:\n(Sugerencia: ${randomSuggestion})`, 
                        user?.user_metadata?.username || randomSuggestion
                      )
                      
                      if (newName && user?.id) {
                        try {
                          const { error } = await supabase
                            .from('profiles')
                            .upsert({
                              id: user.id,
                              username: newName.trim(),
                              avatar_url: user.user_metadata?.avatar_url || '/logo.png',
                              full_name: newName.trim(),
                              updated_at: new Date().toISOString()
                            })
                          if (!error) {
                            alert(`✅ ¡Nombre actualizado a "${newName.trim()}"! Refrescando lista...`)
                            await loadRoomUsers()
                          } else {
                            console.error('Error actualizando:', error)
                            alert('❌ Error al actualizar nombre: ' + error.message)
                          }
                        } catch (err) {
                          console.error('Error en catch:', err)
                          alert('❌ Error: ' + err)
                        }
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                  >
                    ✏️ Cambiar Nombre
                  </button>
                </div>
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
              )}            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
