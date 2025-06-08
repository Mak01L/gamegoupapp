// ChatBox simple para la sala
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Define types for chat messages (with user profile info)
interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  room_id: string;
  created_at: string;
  user_name?: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
}

// Remove old Message interface
// interface Message {
//   id: string;
//   text: string;
//   sender: string; // Podría ser 'user' o 'bot' o un userId
//   timestamp: Date;
//   avatar?: string; // URL del avatar del remitente
//   username?: string; // Nombre de usuario del remitente
// }

export default function ChatBox({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    // TODO: Cargar mensajes iniciales de la sala (roomId) desde Supabase
    // y suscribirse a nuevos mensajes en tiempo real.
    // Ejemplo de carga inicial (simulada) - será reemplazado:
    // setMessages([
    //   { id: '1', text: `Bienvenido a la sala ${roomId}!`, sender: 'System', timestamp: new Date(), username: 'System' },
    // ]);
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !roomId) return;

    // Por ahora, simulamos el envío de mensajes localmente
    // hasta que se configure la tabla de chat en Supabase
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      user_id: user.id,
      room_id: roomId,
      created_at: new Date().toISOString(),
      profiles: {
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario',
        avatar_url: user.user_metadata?.avatar_url
      }
    };

    setMessages(prevMessages => [...prevMessages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-xl border border-violet-700 shadow-xl">
      <div className="p-3 border-b border-violet-700">
        <h3 className="text-lg font-semibold text-violet-400">Chat de la Sala #{roomId}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2.5 max-w-[75%]`}>
              {msg.user_id !== user?.id && (
                <img className="w-8 h-8 rounded-full object-cover" src={msg.profiles?.avatar_url || '/logo.png'} alt={`${msg.profiles?.username || 'Usuario'} avatar`} />
              )}
              <div className={`flex flex-col p-3 rounded-xl ${msg.user_id === user?.id ? 'bg-violet-600 rounded-tr-none' : 'bg-neutral-800 rounded-tl-none'}`}> 
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <span className="text-xs font-semibold text-white">{msg.profiles?.username || 'Usuario'}</span>
                  <span className="text-xs font-normal text-gray-400">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                <p className="text-sm font-normal text-white whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
              {msg.user_id === user?.id && (
                 <img className="w-8 h-8 rounded-full object-cover" src={msg.profiles?.avatar_url || user?.user_metadata?.avatar_url || '/logo.png'} alt={`${msg.profiles?.username || user?.user_metadata?.username || 'Usuario'} avatar`} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center p-3 border-t border-violet-700 bg-neutral-800 rounded-b-xl">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..." 
          className="flex-1 bg-neutral-900 text-white p-2 rounded-lg focus:ring-1 focus:ring-violet-500 outline-none"
          disabled={!user}
        />
        <button 
          type="submit"
          className="ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
          disabled={!user || newMessage.trim() === ''}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
