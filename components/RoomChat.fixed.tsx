'use client'

import React from 'react'

interface RoomChatFixedProps {
  className?: string
  roomId?: string
}

export default function RoomChatFixed({ className, roomId }: RoomChatFixedProps) {
  return (
    <div className={`bg-neutral-900 border-l border-neutral-700 h-full flex flex-col ${className}`}>
      <div className="p-4 border-b border-neutral-700">
        <h2 className="text-white text-lg font-bold">💬 Chat Corregido</h2>
        <p className="text-gray-400 text-sm">Versión corregida del chat</p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="text-center text-gray-400">
          <p className="text-sm">Chat corregido en desarrollo</p>
          {roomId && <p className="text-xs mt-2">Sala: {roomId}</p>}
        </div>
      </div>
    </div>
  )
}
