// Tipos adicionales para el sistema de chat y auto-limpieza
export interface RoomWithUserCount {
  id: string
  nombre: string
  juego: string
  regiones: string[]
  idiomas: string[]
  paises: string[]
  sistemas: string[]
  min_jugadores?: number
  max_jugadores?: number
  creador_id: string
  created_at: string
  active_users_count: number
  total_users_count: number
  room_status: 'EMPTY' | 'SINGLE_USER' | 'ACTIVE'
}

export interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  content: string
  created_at: string
  username?: string
  avatar_url?: string
}

export interface RoomUser {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  last_seen: string
  is_active: boolean
  username?: string
  avatar_url?: string
}

export interface SearchFilters {
  juego: string
  regiones: string[]
  idiomas: string[]
  paises: string[]
  sistemas: string[]
  soloConUsuarios: boolean
  ordenarPor: 'fecha' | 'usuarios' | 'nombre'
}
