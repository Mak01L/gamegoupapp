'use client'

import React from 'react'

interface RoomChatCleanProps {
  className?: string
  roomId?: string
}

export default function RoomChatClean({ className, roomId }: RoomChatCleanProps) {
  return (
    <div className={`bg-neutral-900 border-l border-neutral-700 h-full flex flex-col ${className}`}>
      <div className="p-4 border-b border-neutral-700">
        <h2 className="text-white text-lg font-bold">💬 Chat Limpio</h2>
        <p className="text-gray-400 text-sm">Versión limpia del chat</p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="text-center text-gray-400">
          <p className="text-sm">Chat limpio en desarrollo</p>
          {roomId && <p className="text-xs mt-2">Sala: {roomId}</p>}
        </div>
      </div>
    </div>
  )
}
