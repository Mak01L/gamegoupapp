'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface UserProfileMenuProps {
  userId: string
  username: string
  avatar_url?: string
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  currentUserId?: string
  isCreator?: boolean
  onKickUser?: () => void
}

export default function UserProfileMenu({
  userId,
  username,
  avatar_url,
  isOpen,
  onClose,
  position,
  currentUserId,
  isCreator = false,
  onKickUser,
}: UserProfileMenuProps) {
  const { t } = useTranslation(['chat', 'common'])
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)

  // Verificar si es el usuario actual
  useEffect(() => {
    setIsCurrentUser(userId === currentUserId)
  }, [userId, currentUserId])

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  const handleViewProfile = () => {
    router.push(`/profile/${userId}`)
    onClose()
  }

  const handleSendPrivateMessage = () => {
    // TODO: Implementar mensajes privados en el futuro
    console.log('Enviar mensaje privado a:', username)
    onClose()
  }

  const handleKickUser = () => {
    if (onKickUser) {
      onKickUser()
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay transparente */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menú contextual */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-neutral-800 border border-violet-500 rounded-lg shadow-xl min-w-[200px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateY(-10px)', // Ajustar posición para que aparezca arriba del clic
        }}
      >
        {/* Header del menú con información del usuario */}
        <div className="p-3 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <img
              src={avatar_url || '/logo.png'}
              alt={username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p
                className="text-white font-medium truncate max-w-[120px]"
                title={username}
              >
                {username}
              </p>
              {isCurrentUser && (
                <p className="text-xs text-violet-400">{t('chat.menu.you')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Opciones del menú */}
        <div className="py-2">
          {/* Ver perfil */}
          <button
            onClick={handleViewProfile}
            className="w-full px-4 py-2 text-left text-white hover:bg-violet-600/20 transition-colors flex items-center gap-3"
          >
            <span className="text-lg">👤</span>
            <span className="text-sm">{t('chat.menu.viewProfile')}</span>
          </button>

          {/* Mensaje privado (solo si no es el usuario actual) */}
          {!isCurrentUser && (
            <button
              onClick={handleSendPrivateMessage}
              className="w-full px-4 py-2 text-left text-white hover:bg-violet-600/20 transition-colors flex items-center gap-3"
              disabled
            >
              <span className="text-lg">💬</span>
              <span className="text-sm text-gray-400">
                {t('chat.menu.sendMessage')} {t('common.comingSoon')}
              </span>
            </button>
          )}

          {/* Separador y acciones de moderación */}
          {isCreator && !isCurrentUser && (
            <>
              <div className="border-t border-neutral-700 my-2"></div>

              {/* Expulsar usuario */}
              <button
                onClick={handleKickUser}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-600/20 transition-colors flex items-center gap-3"
              >
                <span className="text-lg">🚫</span>
                <span className="text-sm">{t('chat.menu.kickUser')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
