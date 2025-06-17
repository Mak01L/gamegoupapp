'use client'

import React from 'react'

interface RoomsSidebarProps {
  className?: string
  currentRoomId?: string
}

export default function RoomsSidebar({ className, currentRoomId }: RoomsSidebarProps) {
  return (
    <div className={`bg-neutral-900 border-r border-neutral-700 h-full flex flex-col ${className}`}>
      <div className="p-4 border-b border-neutral-700">
        <h2 className="text-white text-lg font-bold">🎮 Salas Disponibles</h2>
        <p className="text-gray-400 text-sm">Explora y únete a salas</p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="text-center text-gray-400">
          <p className="text-sm">Componente de salas en desarrollo</p>
          <p className="text-xs mt-2">Aquí aparecerán las salas disponibles</p>
        </div>
      </div>
    </div>
  )
}
