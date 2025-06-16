import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Configuración simple de traducciones inline
const resources = {
  es: {
    common: {
      navigation: {
        dashboard: 'Dashboard',
        profile: 'Perfil',
        rooms: 'Salas',
        createRoom: 'Crear Sala',
        logout: 'Cerrar Sesión',
        login: 'Iniciar Sesión',
      },
      misc: {
        exploreRooms: 'Explorar Salas',
        filters: 'Filtros',
        refresh: 'Actualizar',
        searchPlaceholder: 'Buscar por nombre de sala o juego...',
        showing: 'Mostrando',
        of: 'de',
        rooms: 'salas',
        activeRooms: 'salas activas',
        users: 'usuarios',
        enter: 'Entrar',
        createNewRoom: 'Crear Nueva Sala',
        created: 'Creado',
        players: 'jugadores',
        regions: 'Regiones',
        languages: 'Idiomas',
        countries: 'Países',
        systems: 'Sistemas',
        game: 'Juego',
        sortBy: 'Ordenar por',
        activeUsers: 'Usuarios activos',
        mostRecent: 'Más recientes',
        nameAZ: 'Nombre A-Z',
        status: 'Estado',
        onlyActiveRooms: 'Solo salas con usuarios activos',
        noRoomsCreated: 'No hay salas creadas aún',
        beFirst: '¡Sé el primero en crear una sala!',
        noRoomsFound: 'No se encontraron salas',
        adjustFilters: 'Intenta ajustar los filtros de búsqueda',
        loadingRooms: 'Cargando salas...',
        allSystems: 'Todos',
      },
    },
    rooms: {
      title: 'Salas de juego',
      createRoom: 'Crear nueva sala',
      createNewRoom: 'Crear Nueva Sala',
      availableRooms: 'Salas Disponibles',
      noRoomsAvailable: 'No hay salas creadas aún. ¡Crea la primera sala!',
      createdOn: 'Creado',
      create: {
        title: 'Crear Sala',
        success: 'Sala creada correctamente. Redirigiendo...',
        form: {
          roomName: 'Nombre de la sala',
          game: 'Juego',
          region: 'Región',
          language: 'Idioma',
          country: 'País',
          platform: 'Plataforma',
          minPlayers: 'Mín. jugadores',
          maxPlayers: 'Máx. jugadores',
          submit: 'Crear sala',
          optional: 'opcional',
          countryOptional: 'Seleccionar países (opcional)',
          placeholders: {
            roomName: 'Ej: Squad para Ranked',
            minPlayers: 'Número mínimo de jugadores (2-50)',
            maxPlayers: 'Número máximo de jugadores (2-50)',
          },
          tooltips: {
            players: 'Especifica el rango de jugadores permitidos en la sala',
          },
          validation: {
            nameRequired: 'Completa todos los campos obligatorios',
            nameExists: 'Ya existe una sala con ese nombre',
            playersInvalid:
              'El número de jugadores debe estar entre 2-50 y el mínimo no puede ser mayor que el máximo',
          },
        },
      },
      card: {
        enterRoom: 'Entrar a la sala',
        playersCount: '{{min}}-{{max}} jugadores',
      },
    },
  },
  en: {
    common: {
      navigation: {
        dashboard: 'Dashboard',
        profile: 'Profile',
        rooms: 'Rooms',
        createRoom: 'Create Room',
        logout: 'Logout',
        login: 'Sign In',
      },
      misc: {
        exploreRooms: 'Explore Rooms',
        filters: 'Filters',
        refresh: 'Refresh',
        searchPlaceholder: 'Search by room name or game...',
        showing: 'Showing',
        of: 'of',
        rooms: 'rooms',
        activeRooms: 'active rooms',
        users: 'users',
        enter: 'Enter',
        createNewRoom: 'Create New Room',
        created: 'Created',
        players: 'players',
        regions: 'Regions',
        languages: 'Languages',
        countries: 'Countries',
        systems: 'Systems',
        game: 'Game',
        sortBy: 'Sort by',
        activeUsers: 'Active users',
        mostRecent: 'Most recent',
        nameAZ: 'Name A-Z',
        status: 'Status',
        onlyActiveRooms: 'Only rooms with active users',
        noRoomsCreated: 'No rooms created yet',
        beFirst: 'Be the first to create a room!',
        noRoomsFound: 'No rooms found',
        adjustFilters: 'Try adjusting the search filters',
        loadingRooms: 'Loading rooms...',
        allSystems: 'All',
      },
    },
    rooms: {
      title: 'Game Rooms',
      createRoom: 'Create new room',
      createNewRoom: 'Create New Room',
      availableRooms: 'Available Rooms',
      noRoomsAvailable: 'No rooms created yet. Create the first room!',
      createdOn: 'Created',
      create: {
        title: 'Create Room',
        success: 'Room created successfully. Redirecting...',
        form: {
          roomName: 'Room name',
          game: 'Game',
          region: 'Region',
          language: 'Language',
          country: 'Country',
          platform: 'Platform',
          minPlayers: 'Min. players',
          maxPlayers: 'Max. players',
          submit: 'Create room',
          optional: 'optional',
          countryOptional: 'Select countries (optional)',
          placeholders: {
            roomName: 'E.g: Squad for Ranked',
            minPlayers: 'Minimum number of players (2-50)',
            maxPlayers: 'Maximum number of players (2-50)',
          },
          tooltips: {
            players: 'Specify the allowed player range for the room',
          },
          validation: {
            nameRequired: 'Complete all required fields',
            nameExists: 'A room with that name already exists',
            playersInvalid:
              'Player count must be between 2-50 and minimum cannot exceed maximum',
          },
        },
      },
      card: {
        enterRoom: 'Enter room',
        playersCount: '{{min}}-{{max}} players',
      },
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    ns: ['common', 'rooms'],
    defaultNS: 'common',
  })

export default i18n
