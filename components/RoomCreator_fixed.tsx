'use client'

import React, { useState } from 'react'

interface RoomCreatorFixedProps {
  className?: string
  onCreateRoom?: (roomData: any) => void
}

export default function RoomCreatorFixed({ className, onCreateRoom }: RoomCreatorFixedProps) {
  const [roomName, setRoomName] = useState('')
  const [game, setGame] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onCreateRoom) {
      onCreateRoom({ roomName, game })
    }
  }

  return (
    <div className={`bg-neutral-900 rounded-lg border border-neutral-700 p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">🎮 Crear Sala (Corregido)</h2>
        <p className="text-gray-400 text-sm">Versión corregida del creador de salas</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Nombre de la Sala
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white"
            placeholder="Mi sala épica"
          />
        </div>
        
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Juego
          </label>
          <input
            type="text"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white"
            placeholder="Valorant, LoL, etc."
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Crear Sala
        </button>
      </form>
    </div>
  )
}
