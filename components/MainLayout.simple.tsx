'use client'

import { useState, useEffect } from 'react'
import UserRoomsSidebar from './UserRoomsSidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Estado inicial inteligente basado en tamaño de pantalla
  const [sidebarOpen, setSidebarOpen] = useState(false) // Colapsada por defecto
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  // Detectar tamaño de pantalla y ajustar comportamiento
  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 1200 // XL screens
      setIsLargeScreen(isLarge)
      
      // Solo abrir automáticamente en pantallas muy grandes
      if (isLarge && !sidebarOpen) {
        setSidebarOpen(true)
      } else if (!isLarge && sidebarOpen) {
        // Colapsar en pantallas medianas/pequeñas por defecto
        setSidebarOpen(false)
      }
    }

    // Verificar al cargar
    checkScreenSize()
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Obtener el roomId actual de la URL
  const getCurrentRoomId = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const match = path.match(/\/room\/([^\/]+)/)
      return match ? match[1] : undefined
    }
    return undefined
  }
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Botón toggle - MEJORADO CON INDICADOR DE ESTADO */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 text-white p-2.5 rounded-lg shadow-lg transition-all duration-300 ${
          sidebarOpen 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        } lg:hidden`}
        title={sidebarOpen ? "Cerrar Mis Salas" : "Abrir Mis Salas"}
      >
        {sidebarOpen ? '✖' : '🏠'}
      </button>

      {/* Indicador de salas para Desktop cuando sidebar está cerrada */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-all duration-300 items-center gap-2"
          title="Abrir Mis Salas"
        >
          <span>🏠</span>
          <span className="text-xs">Mis Salas</span>
        </button>
      )}      {/* Sidebar Desktop - PEGADA SIN ESPACIOS */}
      <div className={`${
        sidebarOpen 
          ? 'w-56 sm:w-60 md:w-64 lg:w-56 xl:w-60' 
          : 'w-0'
        } transition-all duration-300 hidden lg:block overflow-hidden flex-shrink-0 bg-neutral-900`}>
        <div className="w-full h-full">
          <UserRoomsSidebar 
            currentRoomId={getCurrentRoomId()}
            className="w-full h-full" 
          />
        </div>
      </div>

      {/* Sidebar Móvil - OVERLAY OPTIMIZADO */}
      <div className={`lg:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
        <div className="relative w-64 sm:w-72 h-full max-w-[80vw] bg-neutral-900">
          <UserRoomsSidebar 
            currentRoomId={getCurrentRoomId()}
            className="w-full h-full" 
          />
          <button
            onClick={toggleSidebar}
            className="absolute top-3 right-3 text-white hover:text-gray-300 text-xl z-10 bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✖
          </button>
        </div>
      </div>      {/* Contenido principal - PEGADO COMPLETAMENTE A LA SIDEBAR */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarOpen 
            ? 'lg:ml-56 xl:ml-60' // Margen exacto al ancho de sidebar
            : 'lg:ml-0'
        }`}
      >
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
