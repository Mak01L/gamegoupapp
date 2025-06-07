'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ChatSetupTest() {
  const [setupStatus, setSetupStatus] = useState<{
    chatMessages: boolean
    roomUsers: boolean
    isActiveColumn: boolean
    setupComplete: boolean
  }>({
    chatMessages: false,
    roomUsers: false,
    isActiveColumn: false,
    setupComplete: false
  })

  useEffect(() => {
    checkSetup()
  }, [])

  const checkSetup = async () => {
    try {
      // Test chat_messages table
      const { error: chatError } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1)

      // Test room_users table with is_active column
      const { error: roomUsersError } = await supabase
        .from('room_users')
        .select('is_active')
        .limit(1)

      const chatMessages = !chatError
      const roomUsersWithActive = !roomUsersError
      const setupComplete = chatMessages && roomUsersWithActive

      setSetupStatus({
        chatMessages,
        roomUsers: roomUsersWithActive,
        isActiveColumn: roomUsersWithActive,
        setupComplete
      })
    } catch (error) {
      console.log('Setup check failed:', error)
    }
  }

  return (
    <div className="bg-neutral-800 border border-violet-500 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-violet-300 mb-3">🔧 Estado del Setup del Chat</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${setupStatus.chatMessages ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-white">Tabla chat_messages: {setupStatus.chatMessages ? '✅' : '❌'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${setupStatus.roomUsers ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-white">Tabla room_users: {setupStatus.roomUsers ? '✅' : '❌'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${setupStatus.isActiveColumn ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-white">Columna is_active: {setupStatus.isActiveColumn ? '✅' : '❌'}</span>
        </div>
        
        <div className="mt-3 p-2 rounded border">
          <div className={`text-center font-medium ${setupStatus.setupComplete ? 'text-green-400' : 'text-yellow-400'}`}>
            {setupStatus.setupComplete ? 
              '🎉 Setup del chat COMPLETO - Chat en tiempo real activado!' : 
              '⏳ Setup pendiente - Ejecuta el script SQL en Supabase Dashboard'
            }
          </div>
        </div>
        
        <button 
          onClick={checkSetup}
          className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded transition-colors"
        >
          🔄 Verificar Setup
        </button>
      </div>
    </div>
  )
}
