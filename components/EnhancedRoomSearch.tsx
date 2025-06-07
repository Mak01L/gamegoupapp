'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { RoomWithUserCount, SearchFilters } from '../types/chat.types'

export default function EnhancedRoomSearch() {
  const { t } = useTranslation(['rooms', 'common'])
  const [rooms, setRooms] = useState<RoomWithUserCount[]>([])
  const [filteredRooms, setFilteredRooms] = useState<RoomWithUserCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    juego: '',
    regiones: [],
    idiomas: [],
    paises: [],
    sistemas: [],
    soloConUsuarios: false,
    ordenarPor: 'usuarios'
  })
  const router = useRouter()

  // Opciones para los filtros
  const juegosPopulares = [
    'Valorant', 'League of Legends', 'CS2', 'Overwatch 2', 'Apex Legends',
    'Fortnite', 'Rocket League', 'FIFA 24', 'Call of Duty', 'Minecraft',
    'Among Us', 'Fall Guys', 'Genshin Impact', 'Destiny 2', 'Rainbow Six Siege'
  ]

  const regiones = ['NA', 'EU', 'LATAM', 'BR', 'KR', 'JP', 'OCE', 'CN', 'SEA']
  const idiomas = ['Español', 'English', 'Português', 'Français', 'Deutsch', '日本語', '한국어', '中文']
  const paises = ['México', 'Argentina', 'Colombia', 'España', 'Chile', 'Perú', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia', 'Ecuador']
  const sistemas = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile']
  // Cargar salas con información de usuarios activos
  const fetchRooms = async () => {
    try {
      console.log('🔍 Cargando salas con conteo de usuarios...')
      
      let data, error
      
      // Intentar usar la vista optimizada primero
      const { data: viewData, error: viewError } = await supabase
        .from('rooms_with_user_count')
        .select('*')
        .order('active_users_count', { ascending: false })

      if (!viewError && viewData) {
        data = viewData
        error = null
      } else {
        // Fallback: construir manualmente si la vista no existe
        console.log('⚠️ Vista no disponible, usando fallback...')
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .order('created_at', { ascending: false })

        if (roomsError) throw roomsError

        // Agregar manualmente el conteo de usuarios con mejor rendimiento
        const roomsWithCount = await Promise.all(
          roomsData.map(async (room) => {
            // Usar una sola consulta para obtener ambos conteos
            const { data: userStats } = await supabase
              .from('room_users')
              .select('is_active')
              .eq('room_id', room.id)

            const activeCount = userStats?.filter(u => u.is_active).length || 0
            const totalCount = userStats?.length || 0

            return {
              ...room,
              active_users_count: activeCount,
              total_users_count: totalCount,
              room_status: activeCount === 0 ? 'EMPTY' : activeCount === 1 ? 'SINGLE_USER' : 'ACTIVE'
            }
          })
        )

        data = roomsWithCount
        error = null
      }      console.log('📊 Resultado:', { data, error, rooms_found: data?.length })
        if (error) {
        console.error('❌ Error:', error)
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? String((error as any).message) 
          : 'Error desconocido'
        setError(`Error al cargar salas: ${errorMessage}`)
      } else {
        setRooms(data || [])
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err)
      setError('Error inesperado al cargar las salas')
    }
    setLoading(false)
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...rooms]

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.juego.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por juego
    if (filters.juego) {
      filtered = filtered.filter(room => 
        room.juego.toLowerCase().includes(filters.juego.toLowerCase())
      )
    }

    // Filtro por solo salas con usuarios
    if (filters.soloConUsuarios) {
      filtered = filtered.filter(room => room.active_users_count > 0)
    }

    // Filtros de regiones, idiomas, países, sistemas
    if (filters.regiones.length > 0) {
      filtered = filtered.filter(room => 
        room.regiones?.some(region => filters.regiones.includes(region))
      )
    }

    if (filters.idiomas.length > 0) {
      filtered = filtered.filter(room => 
        room.idiomas?.some(idioma => filters.idiomas.includes(idioma))
      )
    }

    if (filters.paises.length > 0) {
      filtered = filtered.filter(room => 
        room.paises?.some(pais => filters.paises.includes(pais))
      )
    }

    if (filters.sistemas.length > 0) {
      filtered = filtered.filter(room => 
        room.sistemas?.some(sistema => filters.sistemas.includes(sistema))
      )
    }

    // Ordenar
    switch (filters.ordenarPor) {
      case 'usuarios':
        filtered.sort((a, b) => b.active_users_count - a.active_users_count)
        break
      case 'fecha':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'nombre':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
    }

    setFilteredRooms(filtered)
  }, [rooms, searchTerm, filters])

  useEffect(() => {
    fetchRooms()
    
    // Configurar suscripción realtime para cambios en salas y usuarios
    const roomsChannel = supabase
      .channel('rooms_and_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => fetchRooms()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_users'
        },
        () => fetchRooms()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(roomsChannel)
    }
  }, [])
  const toggleFilter = (filterType: keyof SearchFilters, value: string) => {
    if (filterType === 'regiones' || filterType === 'idiomas' || filterType === 'paises' || filterType === 'sistemas') {
      const currentValues = filters[filterType] as string[]
      setFilters(prev => ({
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value]
      }))
    }
  }

  const getRoomStatusIcon = (status: string, userCount: number) => {
    switch (status) {
      case 'EMPTY': return '💤'
      case 'SINGLE_USER': return '👤'
      case 'ACTIVE': return '🔥'
      default: return '❓'
    }
  }

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'EMPTY': return 'text-gray-500'
      case 'SINGLE_USER': return 'text-yellow-400'
      case 'ACTIVE': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (      <div className="text-white text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
        {t('common:misc.loadingRooms')}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">{error}</div>
  }

  return (
    <div className="p-4 text-white max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-violet-300">🔍 {t('common:misc.exploreRooms')}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              showFilters ? 'bg-violet-600 text-white' : 'bg-violet-600/20 text-violet-300 hover:bg-violet-600/30'
            }`}            >
              🎛️ {t('common:misc.filters')}
            </button>
          <button
            onClick={() => {
              setLoading(true)
              fetchRooms()
            }}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl text-sm transition-colors"            disabled={loading}
          >
            🔄 {t('common:misc.refresh')}
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">        <input
          type="text"
          placeholder={t('common:misc.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
        />
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-neutral-900/50 border border-violet-500 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Juego */}
            <div>
              <label className="block text-violet-300 font-medium mb-2">🎮 {t('common:misc.game')}</label>
              <select
                value={filters.juego}
                onChange={(e) => setFilters(prev => ({ ...prev, juego: e.target.value }))}
                className="w-full bg-neutral-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                title="Seleccionar juego"
                aria-label="Filtrar por juego"              >
                <option value="">{t('common:misc.allGames')}</option>
                {juegosPopulares.map(juego => (
                  <option key={juego} value={juego}>{juego}</option>
                ))}
              </select>
            </div>            {/* Ordenar por */}            <div>
              <label className="block text-violet-300 font-medium mb-2">📊 {t('common:misc.sortBy')}</label>
              <select
                value={filters.ordenarPor}
                onChange={(e) => setFilters(prev => ({ ...prev, ordenarPor: e.target.value as any }))}
                className="w-full bg-neutral-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                title="Ordenar salas por"
                aria-label="Ordenar salas por criterio"              >
                <option value="usuarios">{t('common:misc.activeUsers')}</option>
                <option value="fecha">{t('common:misc.mostRecent')}</option>
                <option value="nombre">{t('common:misc.nameAZ')}</option>
              </select>
            </div>

            {/* Solo con usuarios */}            <div>
              <label className="block text-violet-300 font-medium mb-2">👥 {t('common:misc.status')}</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.soloConUsuarios}
                  onChange={(e) => setFilters(prev => ({ ...prev, soloConUsuarios: e.target.checked }))}
                  className="mr-2 rounded"                />
                <span>{t('common:misc.onlyActiveRooms')}</span>
              </label>
            </div>
          </div>

          {/* Filtros de tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">            {[
              { key: 'regiones', label: `🌍 ${t('common:misc.regions')}`, options: regiones },
              { key: 'idiomas', label: `🗣️ ${t('common:misc.languages')}`, options: idiomas },
              { key: 'paises', label: `🏳️ ${t('common:misc.countries')}`, options: paises },
              { key: 'sistemas', label: `💻 ${t('common:misc.systems')}`, options: sistemas }
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label className="block text-violet-300 font-medium mb-2">{label}</label>
                <div className="flex flex-wrap gap-1">
                  {options.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleFilter(key as keyof SearchFilters, option)}                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        (filters[key as keyof SearchFilters] as string[])?.includes(option)
                          ? 'bg-violet-600 text-white'
                          : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas */}      <div className="flex justify-between items-center mb-4 text-sm text-gray-300">
        <span>
          {t('common:misc.showing')} {filteredRooms.length} {t('common:misc.of')} {rooms.length} {t('common:misc.rooms')}
        </span>
        <span>
          {rooms.filter(r => r.active_users_count > 0).length} {t('common:misc.activeRooms')}
        </span>
      </div>

      {/* Lista de salas */}
      <div className="grid gap-4">
        {filteredRooms.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            {rooms.length === 0 ? (              <>
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl mb-2">{t('common:misc.noRoomsCreated')}</h3>
                <p className="mb-4">{t('common:misc.beFirst')}</p>
              </>
            ) : (              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl mb-2">{t('common:misc.noRoomsFound')}</h3>
                <p className="mb-4">{t('common:misc.adjustFilters')}</p>
              </>
            )}
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div key={room.id} className="bg-violet-800/20 border border-violet-500 rounded-xl p-6 hover:bg-violet-800/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-violet-300">{room.nombre}</h3>
                    <span className={`flex items-center gap-1 text-sm ${getRoomStatusColor(room.room_status)}`}>                      {getRoomStatusIcon(room.room_status, room.active_users_count)}
                      {room.active_users_count} {t('common:misc.users')}
                    </span>
                  </div>
                  <p className="text-lg text-white">🎮 {room.juego}</p>
                </div>
                <button
                  onClick={() => router.push(`/room/${room.id}`)}
                  className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-6 rounded-lg transition-colors font-medium"                >
                  🚪 {t('common:misc.enter')}
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">                <div>
                  <span className="text-gray-300">🌍 {t('common:misc.regions')}:</span>
                  <p className="text-white">{room.regiones?.join(', ') || t('common:misc.allRegions')}</p>
                </div>
                <div>
                  <span className="text-gray-300">🗣️ {t('common:misc.languages')}:</span>
                  <p className="text-white">{room.idiomas?.join(', ') || t('common:misc.allSystems')}</p>
                </div>
                <div>
                  <span className="text-gray-300">🏳️ {t('common:misc.countries')}:</span>
                  <p className="text-white">{room.paises?.join(', ') || t('common:misc.allSystems')}</p>
                </div>
                <div>
                  <span className="text-gray-300">💻 {t('common:misc.systems')}:</span>
                  <p className="text-white">{room.sistemas?.join(', ') || t('common:misc.allSystems')}</p>
                </div>
              </div>              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{t('common:misc.created')}: {new Date(room.created_at).toLocaleDateString()}</span>
                {room.min_jugadores && room.max_jugadores && (
                  <span>👥 {room.min_jugadores}-{room.max_jugadores} {t('common:misc.players')}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
        <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/rooms/create')}
          className="bg-violet-600 hover:bg-violet-700 text-white py-4 px-10 rounded-xl transition-colors font-bold text-xl shadow-lg border-2 border-violet-500 hover:border-violet-400"
        >
          ✨ {t('common:misc.createNewRoom')}
        </button>
      </div>
    </div>
  )
}
