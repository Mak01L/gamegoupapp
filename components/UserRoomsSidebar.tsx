'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthProvider.simple'

interface UserRoom {
  id: string
  nombre: string
  juego: string
  region: string
  max_jugadores: number
  isCreator: boolean
  isActive: boolean
  connectedUsers: number
}

interface UserRoomsSidebarProps {
  currentRoomId?: string
  className?: string
}

export default function UserRoomsSidebar({ currentRoomId, className = '' }: UserRoomsSidebarProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [userRooms, setUserRooms] = useState<UserRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false) // Para refresh invisible
  const [userName, setUserName] = useState<string>('') // Para el nombre real

  // Función para obtener el nombre real del usuario
  const getUserName = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()
      
      if (data?.username) {
        return data.username
      }
      
      // Fallback: usar parte del email si está disponible
      if (user?.email) {
        return user.email.split('@')[0]
      }
      
      // Último fallback: usar parte del ID
      return `Usuario${userId.slice(-4)}`
    } catch (err) {
      console.log('⚠️ No se pudo obtener nombre de usuario, usando fallback')
      return user?.email?.split('@')[0] || `Usuario${userId.slice(-4)}`
    }
  }  // Cargar salas del usuario - VERSIÓN OPTIMIZADA PARA REFRESH RÁPIDO
  const loadUserRooms = async (isManualRefresh = false) => {
    try {
      // Solo mostrar loading en carga inicial o refresh manual, no en auto-refresh
      if (!isManualRefresh && userRooms.length === 0) {
        setLoading(true)
      } else if (isManualRefresh) {
        setRefreshing(true)
      }
      
      // Obtener usuario - optimizado para velocidad
      let currentUser = user
      if (!currentUser) {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        currentUser = supabaseUser
      }
      
      if (!currentUser) {
        if (userRooms.length > 0) setUserRooms([])
        if (userName) setUserName('')
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Cargar nombre del usuario solo si no lo tenemos (optimización)
      if (!userName && currentUser.id) {
        const realUserName = await getUserName(currentUser.id)
        setUserName(realUserName)
      }

      // CONSULTA OPTIMIZADA: Menos datos transferidos, más rápido
      const { data: userRoomsData, error: userRoomsError } = await supabase
        .from('room_users')
        .select('room_id')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)

      if (userRoomsError) {
        console.error('❌ Error obteniendo room_users:', userRoomsError)
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Si no hay cambios en el número de salas, no hacer consultas adicionales
      const newRoomCount = userRoomsData?.length || 0
      const currentRoomCount = userRooms.length
      
      if (!isManualRefresh && newRoomCount === currentRoomCount && userRooms.length > 0) {
        // Solo actualizar contadores de usuarios conectados rápidamente
        const updatedRooms = await Promise.all(
          userRooms.map(async (room) => {
            const { count: connectedCount } = await supabase
              .from('room_users')
              .select('*', { count: 'exact' })
              .eq('room_id', room.id)
              .eq('is_active', true)
            
            return {
              ...room,
              connectedUsers: connectedCount || 0
            }
          })
        )
        
        setUserRooms(updatedRooms)
        setLoading(false)
        setRefreshing(false)
        return
      }

      if (newRoomCount === 0) {
        if (userRooms.length > 0) setUserRooms([])
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Solo si hay cambios reales, hacer consulta completa
      const roomIds = userRoomsData.map(ru => ru.room_id)
      
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, nombre, juego, regiones, max_jugadores, creador_id')
        .in('id', roomIds)

      if (roomsError) {
        console.error('❌ Error obteniendo salas:', roomsError)
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Procesar datos con contadores actualizados
      const processedRooms = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { count: connectedCount } = await supabase
            .from('room_users')
            .select('*', { count: 'exact' })
            .eq('room_id', room.id)
            .eq('is_active', true)

          return {
            id: room.id,
            nombre: room.nombre,
            juego: room.juego,
            region: Array.isArray(room.regiones) ? room.regiones[0] : room.regiones || 'Global',
            max_jugadores: room.max_jugadores || 10,
            isCreator: room.creador_id === currentUser.id,
            isActive: true,
            connectedUsers: connectedCount || 0,
          }
        })
      )

      // Ordenar: salas creadas primero, luego alfabéticamente
      processedRooms.sort((a, b) => {
        if (a.isCreator && !b.isCreator) return -1
        if (!a.isCreator && b.isCreator) return 1
        return a.nombre.localeCompare(b.nombre)
      })

      setUserRooms(processedRooms)

    } catch (error) {
      console.error('❌ Error general cargando salas:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }// Cargar salas al montar y cuando cambie el usuario
  useEffect(() => {
    console.log('🔄 useEffect triggered - User:', user ? user.id.slice(-8) : 'No user')
    loadUserRooms(false) // false = no es refresh manual
  }, [user])

  // También cargar cuando se monte el componente por primera vez
  useEffect(() => {
    console.log('🔄 Componente montado, forzando carga inicial...')
    loadUserRooms(false) // false = no es refresh manual
  }, [])
  // Recargar cada 3 segundos de forma INVISIBLE para máxima fluidez
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⚡ Recarga ultra-rápida silenciosa de salas...')
      loadUserRooms(false) // false = refresh automático invisible
    }, 3000) // 3 segundos para máxima fluidez
    return () => clearInterval(interval)
  }, [user])

  const handleRoomClick = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  const handleLeaveRoom = async (roomId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (!user) return

    if (!confirm('¿Salir de esta sala?')) return

    try {
      console.log('🚪 Saliendo de sala:', roomId)
      
      const { error } = await supabase
        .from('room_users')
        .update({ is_active: false })
        .eq('room_id', roomId)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Error saliendo:', error)
        return
      }      // Recargar lista (refresh manual)
      loadUserRooms(true)

      // Si era la sala actual, redirigir
      if (roomId === currentRoomId) {
        router.push('/rooms')
      }
    } catch (error) {
      console.error('❌ Error:', error)
    }
  }

  const handleCreateRoom = () => {
    router.push('/rooms/create')
  }
  const handleBrowseRooms = () => {
    router.push('/rooms')
  }

  return (
    <div className={`bg-neutral-900 h-full flex flex-col ${className}`}>
      {/* Header - ULTRA COMPACTO */}
      <div className="p-2 lg:p-3 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-sm lg:text-base font-bold">
            🏠 Mis Salas
          </h2>
          <button
            onClick={() => loadUserRooms(true)}
            className="text-gray-400 hover:text-white text-xs bg-neutral-800 hover:bg-neutral-700 px-1.5 py-1 rounded transition-colors"
            title="Refrescar salas"
            disabled={refreshing}
          >
            {refreshing ? '⏳' : '🔄'}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          {loading ? 'Cargando...' : `${userRooms.length} ${userRooms.length === 1 ? 'sala' : 'salas'}`}
        </p>
        {userName && (
          <p className="text-green-400 text-xs font-medium mt-1 truncate">
            👤 {userName}
          </p>
        )}
      </div>      {/* Botones de acción - ULTRA COMPACTOS */}
      <div className="p-2 space-y-1.5 border-b border-neutral-700">
        <button
          onClick={handleCreateRoom}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded transition-colors text-xs font-medium"
        >
          ➕ Crear Sala
        </button>
        <button
          onClick={handleBrowseRooms}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded transition-colors text-xs font-medium"
        >
          🔍 Buscar Salas
        </button>
      </div>      {/* Lista de salas - MÁXIMA COMPACIDAD */}
      <div className="flex-1 overflow-y-auto p-1.5">
        {loading ? (
          <div className="text-center text-gray-400 py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-xs">Cargando...</p>
          </div>
        ) : userRooms.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            <div className="text-2xl mb-2">🏠</div>
            <p className="text-xs mb-2 font-medium">No tienes salas activas</p>
            <div className="text-xs text-gray-500 space-y-1 mb-3">
              <p>• Crea una nueva sala</p>
              <p>• Únete a una sala existente</p>
              {userName && (
                <p className="text-green-400 font-medium">
                  👤 Hola, {userName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleCreateRoom}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1.5 rounded transition-colors"
              >
                ➕ Crear Sala
              </button>
              <button
                onClick={handleBrowseRooms}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1.5 rounded transition-colors"
              >
                🔍 Buscar Salas
              </button>
            </div>
          </div>        ) : (
          <div className="space-y-1.5">
            {userRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className={`rounded p-1.5 border cursor-pointer transition-all group ${
                  room.id === currentRoomId
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-neutral-800 border-neutral-700 hover:border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      {room.id === currentRoomId && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                      )}
                      <h3 className="text-white font-medium text-xs truncate">
                        {room.nombre}
                      </h3>
                      {room.isCreator && (
                        <span className="bg-yellow-600 text-white text-xs px-1 py-0.5 rounded flex-shrink-0">
                          👑
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs truncate">
                      🎮 {room.juego}
                    </p>
                    <p className="text-gray-500 text-xs">
                      📍 {room.region} • {room.connectedUsers}/{room.max_jugadores}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleLeaveRoom(room.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 text-xs transition-opacity flex-shrink-0 ml-1"
                    title="Salir"
                  >
                    ✖
                  </button>
                </div>
                
                {room.id === currentRoomId && (
                  <div className="text-xs text-green-400 mt-1">
                    ● Conectado
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>      {/* Footer - MÁXIMA COMPACIDAD */}
      {userRooms.length > 0 && (
        <div className="p-1.5 border-t border-neutral-700 text-center">
          <div className="text-xs text-gray-400">
            <span className="text-yellow-400 font-medium">
              {userRooms.filter(r => r.isCreator).length}
            </span> creadas • 
            <span className="text-blue-400 font-medium ml-1">
              {userRooms.filter(r => !r.isCreator).length}
            </span> participando
          </div>
        </div>
      )}
    </div>
  )
}
