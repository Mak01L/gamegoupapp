'use client'

import { useState } from 'react'
import ChatSidebar from './ChatSidebar'
import { useChatManager } from './ChatManager'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {
    activeRooms,
    removeRoom,
    toggleMinimizeRoom,
    clearUnreadMessages,
    setCurrentRoom,
  } = useChatManager()
  const router = useRouter()
  const { t } = useTranslation('common')

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

  return (
    <div className="flex min-h-screen bg-black">
      {/* Botón flotante para abrir sidebar (solo visible cuando hay salas activas) */}
      {activeRooms.length > 0 && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-20 left-4 z-40 bg-[#EA2831] text-white p-3 rounded-full shadow-lg hover:bg-[#D41F28] transition-all duration-300 lg:hidden ${
            sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
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

      {/* ChatSidebar */}
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

      {/* Contenido principal */}
      <div
        className={`flex-1 transition-all duration-300 ${
          activeRooms.length > 0 ? 'lg:ml-80' : ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}
