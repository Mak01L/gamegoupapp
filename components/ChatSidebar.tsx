'use client'

import React from 'react'

interface ActiveRoom {
  id: string
  name: string
  game: string
  isMinimized: boolean
  unreadMessages: number
  lastActivity: string
  isActive: boolean
}

interface ChatSidebarProps {
  className?: string
  isOpen?: boolean
  onToggle?: () => void
  activeRooms?: ActiveRoom[]
  onRoomClick?: (roomId: string) => void
  onMinimizeRoom?: (roomId: string) => void
  onCloseRoom?: (roomId: string) => void
}

export default function ChatSidebar({ 
  className, 
  isOpen, 
  onToggle, 
  activeRooms = [], 
  onRoomClick, 
  onMinimizeRoom, 
  onCloseRoom 
}: ChatSidebarProps) {  return (
    <div className={`bg-neutral-900 border-r border-neutral-700 h-full flex flex-col ${className}`}>
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-bold">💬 Chat Activo</h2>
          {onToggle && (
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white text-sm"
              title={isOpen ? "Minimizar" : "Expandir"}
            >
              {isOpen ? "−" : "+"}
            </button>
          )}
        </div>
        <p className="text-gray-400 text-sm">
          {activeRooms.length} sala{activeRooms.length !== 1 ? 's' : ''} activa{activeRooms.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeRooms.length > 0 ? (
          <div className="p-2 space-y-2">
            {activeRooms.map((room) => (
              <div
                key={room.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  room.isActive 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-neutral-800 border-neutral-600 text-gray-300 hover:bg-neutral-700'
                }`}
                onClick={() => onRoomClick?.(room.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{room.name}</h3>
                    <p className="text-xs opacity-75">{room.game}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {room.unreadMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {room.unreadMessages}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onMinimizeRoom?.(room.id)
                      }}
                      className="text-gray-400 hover:text-white text-xs p-1"
                      title="Minimizar"
                    >
                      −
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCloseRoom?.(room.id)
                      }}
                      className="text-gray-400 hover:text-red-400 text-xs p-1"
                      title="Cerrar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm">No hay salas activas</p>
              <p className="text-xs mt-1">Únete a una sala para empezar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
