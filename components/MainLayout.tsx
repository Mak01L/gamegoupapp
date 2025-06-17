'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import ChatSidebar from './ChatSidebar'
import RoomsSidebar from './RoomsSidebar.simple'
import { useChatManager } from './ChatManager'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roomsSidebarOpen, setRoomsSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation('common')
  
  // Extraer ID de sala actual desde la URL
  const currentRoomId = pathname?.match(/\/room\/([^\/]+)/)?.[1] || null
  
  const {
    activeRooms,
    removeRoom,
    toggleMinimizeRoom,
    clearUnreadMessages,
    setCurrentRoom,
  } = useChatManager()

  const handleRoomClick = (roomId: string) => {
    clearUnreadMessages(roomId)
    setCurrentRoom(roomId)
    router.push(`/room/${roomId}`)
    setSidebarOpen(false) // Cerrar sidebar en móvil
  }

  const handleMinimizeRoom = (roomId: string) => {
    toggleMinimizeRoom(roomId)
  }

  const handleCloseRoom = (roomId: string) => {
    removeRoom(roomId)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleRoomsSidebar = () => {
    setRoomsSidebarOpen(!roomsSidebarOpen)
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Botón para toggle del RoomsSidebar */}
      <button
        onClick={toggleRoomsSidebar}
        className="fixed top-4 left-4 z-50 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-lg shadow-lg transition-all duration-200 lg:hidden"
        title="Mis Salas"
      >
        🏠
      </button>

      {/* RoomsSidebar - Sidebar izquierdo principal - RESPONSIVE */}
      <div className={`${
        roomsSidebarOpen 
          ? 'w-72 sm:w-80 md:w-72 lg:w-80 xl:w-96' 
          : 'w-0'
        } transition-all duration-300 hidden lg:block flex-shrink-0`}>
        <RoomsSidebar 
          isOpen={roomsSidebarOpen} 
          className="w-full h-full" 
          currentRoomId={currentRoomId}
        />
      </div>

      {/* RoomsSidebar móvil - MEJORADO */}
      <div className={`lg:hidden fixed inset-0 z-40 ${roomsSidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="absolute inset-0 bg-black bg-opacity-60"
          onClick={toggleRoomsSidebar}
        />
        <div className="relative w-80 sm:w-96 h-full max-w-[90vw]">
          <RoomsSidebar 
            isOpen={roomsSidebarOpen} 
            className="w-full h-full" 
            currentRoomId={currentRoomId}
          />
          <button
            onClick={toggleRoomsSidebar}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-xl z-10"
          >
            ✖️
          </button>
        </div>
      </div>

      {/* Botón flotante para abrir ChatSidebar - POSICIÓN MEJORADA */}
      {activeRooms.length > 0 && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 z-40 bg-[#EA2831] text-white p-3 rounded-full shadow-lg hover:bg-[#D41F28] transition-all duration-300 ${
            roomsSidebarOpen 
              ? 'left-[290px] sm:left-[330px] md:left-[290px] lg:left-[330px] xl:left-[410px]' 
              : 'left-20'
          } ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          title={t('sidebar.activeRooms')}
        >
          💬
          {activeRooms.filter((room) => room.unreadMessages > 0).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeRooms.reduce(
                (total, room) => total + room.unreadMessages,
                0
              ) > 99
                ? '99+'
                : activeRooms.reduce(
                    (total, room) => total + room.unreadMessages,
                    0
                  )}
            </span>
          )}
        </button>
      )}

      {/* ChatSidebar - RESPONSIVE */}
      {activeRooms.length > 0 && (
        <ChatSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          activeRooms={activeRooms}
          onRoomClick={handleRoomClick}
          onMinimizeRoom={handleMinimizeRoom}
          onCloseRoom={handleCloseRoom}
        />
      )}

      {/* Contenido principal - DISTRIBUCIÓN MEJORADA */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          roomsSidebarOpen 
            ? 'lg:ml-72 lg:pl-2 xl:ml-96 xl:pl-4' 
            : 'lg:ml-0'
        } ${
          activeRooms.length > 0 && sidebarOpen 
            ? 'lg:mr-72 lg:pr-2 xl:mr-80 xl:pr-4' 
            : ''
        } px-2 sm:px-4 lg:px-2`}
      >
        <div className="w-full h-full max-w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
