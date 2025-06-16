'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'

interface ActiveRoom {
  id: string
  name: string
  game: string
  isMinimized: boolean
  unreadMessages: number
  lastActivity: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeRooms: ActiveRoom[]
  onRoomClick: (roomId: string) => void
  onMinimizeRoom: (roomId: string) => void
  onCloseRoom: (roomId: string) => void
}

export default function ChatSidebar({
  isOpen,
  onToggle,
  activeRooms,
  onRoomClick,
  onMinimizeRoom,
  onCloseRoom,
}: ChatSidebarProps) {
  const { t } = useTranslation('common')
  const router = useRouter()

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#1A1A1A] border-r border-[#303030] transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-80`}
      >
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-[#303030]">
          <h2 className="text-[#FFFFFF] text-lg font-bold">
            🎮 Salas Activas
          </h2>
          <button
            onClick={onToggle}
            className="lg:hidden text-[#ABABAB] hover:text-[#FFFFFF] transition-colors"
          >
            ✖️
          </button>
        </div>

        {/* Lista de salas activas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeRooms.length === 0 ? (
            <div className="text-center text-[#ABABAB] py-8">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm">No hay salas activas</p>
              <button
                onClick={() => router.push('/rooms')}
                className="mt-3 px-4 py-2 bg-[#EA2831] text-[#FFFFFF] rounded-lg text-sm hover:bg-[#D41F28] transition-colors"
              >
                Buscar Salas
              </button>
            </div>
          ) : (
            activeRooms.map((room) => (
              <div
                key={room.id}
                className="bg-[#212121] rounded-lg p-3 border border-[#303030] hover:border-[#EA2831] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#FFFFFF] font-medium text-sm truncate">
                      {room.name}
                    </h3>
                    <p className="text-[#ABABAB] text-xs truncate">
                      🎮 {room.game}
                    </p>
                  </div>

                  {/* Indicador de mensajes no leídos */}
                  {room.unreadMessages > 0 && (
                    <span className="bg-[#EA2831] text-[#FFFFFF] text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {room.unreadMessages > 99 ? '99+' : room.unreadMessages}
                    </span>
                  )}
                </div>

                {/* Estado de la sala */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      room.isMinimized
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        : 'bg-[#22C55E]/20 text-[#22C55E]'
                    }`}
                  >
                    {room.isMinimized ? '📝 Minimizada' : '💬 Activa'}
                  </span>

                  <div className="flex gap-1">
                    {/* Botón maximizar/minimizar */}
                    <button
                      onClick={() => onMinimizeRoom(room.id)}
                      className="text-[#ABABAB] hover:text-[#F59E0B] transition-colors p-1"
                      title={room.isMinimized ? 'Maximizar' : 'Minimizar'}
                    >
                      {room.isMinimized ? '🔼' : '🔽'}
                    </button>

                    {/* Botón ir a sala */}
                    <button
                      onClick={() => onRoomClick(room.id)}
                      className="text-[#ABABAB] hover:text-[#22C55E] transition-colors p-1"
                      title="Ir a la sala"
                    >
                      👁️
                    </button>

                    {/* Botón cerrar */}
                    <button
                      onClick={() => onCloseRoom(room.id)}
                      className="text-[#ABABAB] hover:text-[#EF4444] transition-colors p-1"
                      title="Cerrar sala"
                    >
                      ❌
                    </button>
                  </div>
                </div>

                {/* Última actividad */}
                <div className="mt-2 text-xs text-[#ABABAB]">
                  Última actividad: {room.lastActivity}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-[#303030]">
          <button
            onClick={() => router.push('/rooms')}
            className="w-full px-4 py-2 bg-[#292929] text-[#FFFFFF] rounded-lg text-sm hover:bg-[#353535] transition-colors border border-[#303030]"
          >
            🔍 Buscar Más Salas
          </button>
        </div>
      </div>
    </>
  )
}
