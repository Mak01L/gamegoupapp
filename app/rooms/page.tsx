'use client'

import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import AdWidget from '../../components/AdWidget'

interface Room {
  id: string
  nombre: string
  juego: string
  regiones: string[]
  idiomas: string[]
  paises: string[]
  sistemas: string[]
  min_jugadores: number
  max_jugadores: number
  creador_id: string
  created_at: string
}

export default function RoomsPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    game: '',
    region: '',
    language: '',
    minPlayers: '',
    maxPlayers: '',
  })

  // Cargar salas reales de la base de datos
  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error cargando salas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar salas basado en la búsqueda y filtros
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.juego.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilters =
      (!filters.game ||
        room.juego.toLowerCase().includes(filters.game.toLowerCase())) &&
      (!filters.region ||
        room.regiones.some((r) =>
          r.toLowerCase().includes(filters.region.toLowerCase())
        )) &&
      (!filters.language ||
        room.idiomas.some((l) =>
          l.toLowerCase().includes(filters.language.toLowerCase())
        ))

    return matchesSearch && matchesFilters
  })
  const handleJoinRoom = (roomId: string) => {
    // Navegar a la página de la sala específica
    router.push(`/room/${roomId}`)
  }

  const handleRefresh = () => {
    // Aquí implementarás la lógica para refrescar las salas
    console.log('Refrescando salas...')
    window.location.reload()
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-black"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header Section */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <h1 className="text-[#FFFFFF] tracking-light text-[32px] font-bold leading-tight">
                  🔍 {t('misc.exploreRooms')}
                </h1>
                <p className="text-[#ABABAB] text-base font-normal leading-normal">
                  Encuentra salas de juego y únete a la diversión
                </p>
              </div>
            </div>
            {/* Search Bar */}
            <div className="flex flex-col gap-3 px-4 py-3">
              <input
                type="text"
                placeholder={t('misc.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#FFFFFF] focus:outline-0 focus:ring-0 border border-[#303030] bg-[#212121] focus:border-[#EA2831] h-14 placeholder:text-[#ABABAB] p-[15px] text-base font-normal leading-normal"
              />
            </div>
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] transition-colors ${
                    showFilters
                      ? 'bg-[#EA2831] text-[#FFFFFF] hover:bg-[#D41F28]'
                      : 'bg-[#292929] text-[#FFFFFF] hover:bg-[#353535]'
                  }`}
                >
                  <span className="truncate">🎛️ {t('misc.filters')}</span>
                </button>
                <button
                  onClick={handleRefresh}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#292929] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#353535] transition-colors"
                >
                  <span className="truncate">🔄 {t('misc.refresh')}</span>
                </button>
              </div>
            </div>
            {/* Filters Panel */}
            {showFilters && (
              <div className="mx-4 mb-4 p-4 rounded-xl bg-[#212121] border border-[#303030]">
                <h3 className="text-[#FFFFFF] text-base font-bold mb-3">
                  Filtros de Búsqueda
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#ABABAB] text-sm mb-2">
                      Juego
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del juego"
                      value={filters.game}
                      onChange={(e) =>
                        setFilters({ ...filters, game: e.target.value })
                      }
                      className="w-full bg-[#1A1A1A] border border-[#303030] rounded-lg px-3 py-2 text-[#FFFFFF] text-sm focus:border-[#EA2831] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#ABABAB] text-sm mb-2">
                      Región
                    </label>
                    <input
                      type="text"
                      placeholder="Región"
                      value={filters.region}
                      onChange={(e) =>
                        setFilters({ ...filters, region: e.target.value })
                      }
                      className="w-full bg-[#1A1A1A] border border-[#303030] rounded-lg px-3 py-2 text-[#FFFFFF] text-sm focus:border-[#EA2831] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#ABABAB] text-sm mb-2">
                      Idioma
                    </label>
                    <input
                      type="text"
                      placeholder="Idioma"
                      value={filters.language}
                      onChange={(e) =>
                        setFilters({ ...filters, language: e.target.value })
                      }
                      className="w-full bg-[#1A1A1A] border border-[#303030] rounded-lg px-3 py-2 text-[#FFFFFF] text-sm focus:border-[#EA2831] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      setFilters({
                        game: '',
                        region: '',
                        language: '',
                        minPlayers: '',
                        maxPlayers: '',
                      })
                    }
                    className="px-4 py-2 bg-[#292929] text-[#FFFFFF] rounded-lg text-sm hover:bg-[#353535] transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            )}
            {/* Stats */}
            <div className="flex flex-wrap justify-between gap-3 px-4 py-2">
              <p className="text-[#ABABAB] text-sm font-normal leading-normal">
                Mostrando {filteredRooms.length} de {rooms.length} salas
              </p>
              <p className="text-[#ABABAB] text-sm font-normal leading-normal">
                {rooms.length} salas activas
              </p>
            </div>{' '}
            
            {/* Publicidad antes de la lista de salas */}
            <div className="flex justify-center px-4 py-2">
              <AdWidget variant="banner" className="max-w-[728px] w-full" />
            </div>
            
            {/* Rooms List */}
            <div className="flex flex-col gap-4 px-4 py-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-[#ABABAB] text-lg">Cargando salas...</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#ABABAB] text-lg">
                    {rooms.length === 0
                      ? 'No hay salas disponibles. ¡Crea la primera!'
                      : 'No se encontraron salas que coincidan con tu búsqueda'}
                  </p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex flex-col gap-4 rounded-xl bg-[#212121] p-6 border border-[#303030]"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div className="flex flex-col gap-2">
                        {' '}
                        <div className="flex items-center gap-3">
                          <h3 className="text-[#FFFFFF] text-xl font-bold leading-tight tracking-[-0.015em]">
                            {room.nombre}
                          </h3>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#22C55E]/20">
                            <span className="text-sm font-medium text-[#22C55E]">
                              � Activa
                            </span>
                          </div>
                        </div>
                        <p className="text-[#ABABAB] text-base font-normal leading-normal">
                          🎮 {room.juego}
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#EA2831] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#D41F28] transition-all"
                      >
                        <span className="truncate">🚪 Entrar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-[#ABABAB] text-sm font-medium leading-normal">
                          🌍 Región
                        </p>
                        <p className="text-[#FFFFFF] text-sm font-normal leading-normal">
                          {room.regiones.join(', ')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[#ABABAB] text-sm font-medium leading-normal">
                          🗣️ Idioma
                        </p>
                        <p className="text-[#FFFFFF] text-sm font-normal leading-normal">
                          {room.idiomas.join(', ')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[#ABABAB] text-sm font-medium leading-normal">
                          🏳️ País
                        </p>
                        <p className="text-[#FFFFFF] text-sm font-normal leading-normal">
                          {room.paises.join(', ')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[#ABABAB] text-sm font-medium leading-normal">
                          💻 Plataforma
                        </p>
                        <p className="text-[#FFFFFF] text-sm font-normal leading-normal">
                          {room.sistemas.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-[#303030]">
                      <p className="text-[#ABABAB] text-xs font-normal leading-normal">
                        Creado el{' '}
                        {new Date(room.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[#ABABAB] text-xs font-normal leading-normal">
                        👥 {room.min_jugadores}-{room.max_jugadores} jugadores
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Create Room Button */}
            <div className="flex justify-center px-4 py-8">
              <a
                href="/rooms/create"
                className="flex min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-[#EA2831] text-[#FFFFFF] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#D41F28] transition-all shadow-lg"
              >
                <span className="truncate">✨ Crear Nueva Sala</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
