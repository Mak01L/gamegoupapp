'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { supabase } from '../lib/supabaseClient'

interface ActiveRoom {
  id: string
  name: string
  game: string
  isMinimized: boolean
  unreadMessages: number
  lastActivity: string
  isActive: boolean
}

interface ChatContextType {
  activeRooms: ActiveRoom[]
  addRoom: (
    room: Omit<
      ActiveRoom,
      'isMinimized' | 'unreadMessages' | 'lastActivity' | 'isActive'
    >
  ) => void
  removeRoom: (roomId: string) => void
  minimizeRoom: (roomId: string) => void
  maximizeRoom: (roomId: string) => void
  toggleMinimizeRoom: (roomId: string) => void
  setRoomActive: (roomId: string, isActive: boolean) => void
  incrementUnreadMessages: (roomId: string) => void
  clearUnreadMessages: (roomId: string) => void
  getCurrentRoom: () => string | null
  setCurrentRoom: (roomId: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChatManager() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatManager must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)

  // Función para validar si el usuario pertenece a las salas
  const validateUserRooms = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setActiveRooms([])
        return
      }

      // Obtener salas donde el usuario está activo
      const { data: userRooms, error } = await supabase
        .from('room_users')
        .select(`
          room_id,
          rooms (
            id,
            name,
            game
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        console.error('Error validating user rooms:', error)
        return
      }

      // Filtrar salas activas para mostrar solo aquellas donde el usuario está presente
      setActiveRooms((prev) => {
        const validRoomIds = userRooms?.map((ur) => ur.room_id) || []
        const filteredRooms = prev.filter((room) => validRoomIds.includes(room.id))

        // Actualizar con información fresca de la base de datos
        const updatedRooms = filteredRooms.map((room) => {
          const roomData = userRooms?.find((ur) => ur.room_id === room.id)
          if (roomData && roomData.rooms && typeof roomData.rooms === 'object' && !Array.isArray(roomData.rooms)) {
            return {
              ...room,
              name: (roomData.rooms as any).name || room.name,
              game: (roomData.rooms as any).game || room.game,
            }
          }
          return room
        })

        return updatedRooms
      })
    } catch (error) {
      console.error('Error in validateUserRooms:', error)
    }
  }

  // Cargar salas desde localStorage al inicializar y validar
  useEffect(() => {
    const loadAndValidateRooms = async () => {
      const savedRooms = localStorage.getItem('gamegorup-active-rooms')
      if (savedRooms) {
        try {
          const rooms = JSON.parse(savedRooms)
          setActiveRooms(rooms)
        } catch (error) {
          console.error('Error loading saved rooms:', error)
        }
      }

      // Validar salas después de cargar
      await validateUserRooms()
    }

    loadAndValidateRooms()

    // Validar cada 30 segundos
    const interval = setInterval(validateUserRooms, 30000)
    return () => clearInterval(interval)
  }, [])

  // Guardar salas en localStorage cuando cambien
  useEffect(() => {
    if (activeRooms.length > 0) {
      localStorage.setItem(
        'gamegorup-active-rooms',
        JSON.stringify(activeRooms)
      )
    }
  }, [activeRooms])

  const addRoom = (
    room: Omit<
      ActiveRoom,
      'isMinimized' | 'unreadMessages' | 'lastActivity' | 'isActive'
    >
  ) => {
    setActiveRooms((prev) => {
      const exists = prev.find((r) => r.id === room.id)
      if (exists) {
        // Si ya existe, actualizarla y ponerla como activa
        return prev.map((r) =>
          r.id === room.id
            ? {
                ...r,
                isMinimized: false,
                isActive: true,
                lastActivity: new Date().toLocaleTimeString(),
              }
            : r
        )
      }

      // Si no existe, agregarla
      const newRoom: ActiveRoom = {
        ...room,
        isMinimized: false,
        unreadMessages: 0,
        lastActivity: new Date().toLocaleTimeString(),
        isActive: true,
      }

      return [...prev, newRoom]
    })
  }

  const removeRoom = (roomId: string) => {
    setActiveRooms((prev) => prev.filter((room) => room.id !== roomId))
    if (currentRoom === roomId) {
      setCurrentRoom(null)
    }
  }

  const minimizeRoom = (roomId: string) => {
    setActiveRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, isMinimized: true, isActive: false }
          : room
      )
    )
  }

  const maximizeRoom = (roomId: string) => {
    setActiveRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, isMinimized: false, isActive: true }
          : room
      )
    )
  }

  const toggleMinimizeRoom = (roomId: string) => {
    setActiveRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              isMinimized: !room.isMinimized,
              isActive: room.isMinimized,
            }
          : room
      )
    )
  }

  const setRoomActive = (roomId: string, isActive: boolean) => {
    setActiveRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, isActive, lastActivity: new Date().toLocaleTimeString() }
          : room
      )
    )
  }

  const incrementUnreadMessages = (roomId: string) => {
    setActiveRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              unreadMessages: room.unreadMessages + 1,
              lastActivity: new Date().toLocaleTimeString(),
            }
          : room
      )
    )
  }

  const clearUnreadMessages = (roomId: string) => {
    setActiveRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, unreadMessages: 0 } : room
      )
    )
  }

  const getCurrentRoom = () => currentRoom

  const value: ChatContextType = {
    activeRooms,
    addRoom,
    removeRoom,
    minimizeRoom,
    maximizeRoom,
    toggleMinimizeRoom,
    setRoomActive,
    incrementUnreadMessages,
    clearUnreadMessages,
    getCurrentRoom,
    setCurrentRoom,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
