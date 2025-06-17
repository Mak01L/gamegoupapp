'use client'

import React from 'react'

interface ChatSidebarProps {
  className?: string
}

export default function ChatSidebar({ className }: ChatSidebarProps) {
  return (
    <div className={`bg-neutral-900 border-r border-neutral-700 h-full flex flex-col ${className}`}>
      <div className="p-4 border-b border-neutral-700">
        <h2 className="text-white text-lg font-bold">💬 Chat</h2>
        <p className="text-gray-400 text-sm">Chat de la sala activa</p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="text-center text-gray-400">
          <p className="text-sm">Componente de chat en desarrollo</p>
        </div>
      </div>
    </div>
  )
}
