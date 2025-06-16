'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Combobox } from '@headlessui/react'
import countryFlagEmoji from 'country-flag-emoji'
import {
  FaWindows,
  FaPlaystation,
  FaXbox,
  FaApple,
  FaLinux,
  FaAndroid,
  FaSteam,
  FaGlobe,
  FaMobileAlt,
  FaGamepad,
  FaQuestion,
} from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

// Lista extendida de juegos online populares organizados por categorías
const JUEGOS = [
  // 🔥 TOP TIER - Los más populares 2024
  'Valorant',
  'League of Legends',
  'Counter-Strike 2',
  'Fortnite',
  'Apex Legends',
  'Minecraft',
  'Roblox',
  'Call of Duty: Modern Warfare III',
  'Overwatch 2',
  'PUBG',
  'Rocket League',
  'Genshin Impact',
  'FIFA 24',
  'Dota 2',
  'Among Us',

  // 🎮 BATTLE ROYALE
  'Fall Guys',
  'Warzone',
  'Naraka: Bladepoint',
  'Super People',
  'The Finals',
  'Hunt: Showdown 1896',
  'Vampire: The Masquerade - Bloodhunt',
  'Darwin Project',

  // ⚔️ FPS & SHOOTERS
  'Rainbow Six Siege',
  'Escape from Tarkov',
  'Team Fortress 2',
  'Paladins',
  'Splitgate',
  'Enlisted',
  'World War 3',
  'Hell Let Loose',
  'Deep Rock Galactic',
  'Left 4 Dead 2',
  'Payday 3',
  'Insurgency: Sandstorm',
  'Ready or Not',
  'Battlefield 2042',
  'Star Wars Battlefront II',
  'Destiny 2',
  'Halo Infinite',
  'The Cycle: Frontier',
  'Phantom Forces',
  'Krunker.io',
  'Shell Shockers',

  // 🏆 ESPORTS & MOBA
  'Smite',
  'Heroes of Newerth',
  'Mobile Legends: Bang Bang',
  'Wild Rift',
  'Arena of Valor',
  'Pokemon Unite',
  'Brawl Stars',
  'Clash Royale',

  // 🌍 MMORPG & RPG
  'World of Warcraft',
  'Final Fantasy XIV',
  'Guild Wars 2',
  'Black Desert Online',
  'New World',
  'Lost Ark',
  'Elder Scrolls Online',
  'Star Wars: The Old Republic',
  'RuneScape',
  'Old School RuneScape',
  'MapleStory',
  'Path of Exile',
  'Diablo IV',
  'Diablo II: Resurrected',
  'Albion Online',
  'EVE Online',
  'Blade & Soul',
  'Lineage 2',
  'Aion',
  'TERA',
  'Archeage',
  'Neverwinter',
  'DC Universe Online',
  'Lord of the Rings Online',
  'Age of Conan',
  'Warhammer Online',
  'Camelot Unchained',
  'Ashes of Creation',
  'Crowfall',

  // 🏗️ SURVIVAL & SANDBOX
  'Rust',
  'ARK: Survival Evolved',
  'DayZ',
  'Green Hell',
  'The Forest',
  'Subnautica',
  'Raft',
  'Valheim',
  'Project Zomboid',
  'Unturned',
  'Scum',
  'V Rising',
  'Conan Exiles',
  'Astroneer',
  "No Man's Sky",
  'Satisfactory',
  'Terraria',
  'Starbound',
  'Core Keeper',
  'Grounded',
  '7 Days to Die',

  // 🚗 RACING & SPORTS
  'Forza Horizon 5',
  'Gran Turismo 7',
  'F1 23',
  'Dirt Rally 2.0',
  'Need for Speed Heat',
  'Wreckfest',
  'BeamNG.drive',
  'Assetto Corsa',
  'iRacing',
  'rFactor 2',
  'Mario Kart 8 Deluxe',
  'Burnout Paradise',
  'NBA 2K24',
  'Madden NFL 24',
  'NHL 24',
  'MLB The Show 23',
  'PES 2024',
  'Tennis World Tour',
  'Golf It!',
  'Fall Guys',

  // 🧩 PUZZLE & PARTY
  'Phasmophobia',
  'It Takes Two',
  'A Way Out',
  'Portal 2',
  'Keep Talking and Nobody Explodes',
  'Moving Out',
  'Overcooked! 2',
  'Gang Beasts',
  'Human: Fall Flat',
  'Jackbox Games',
  'Stumble Guys',
  'Wobble Dogs',
  'Party Animals',
  'Rubber Bandits',

  // 🎲 STRATEGY & CARD GAMES
  'Hearthstone',
  'Legends of Runeterra',
  'Magic: The Gathering Arena',
  'Gwent',
  'Shadowverse',
  'Yu-Gi-Oh! Master Duel',
  'Poker',
  'Chess.com',
  'Age of Empires IV',
  'StarCraft II',
  'Command & Conquer Remastered',
  'Total War: Warhammer III',
  'Civilization VI',
  'Crusader Kings III',

  // 📱 MOBILE GAMES
  'Clash of Clans',
  'Clash Royale',
  'Free Fire',
  'Call of Duty Mobile',
  'Pokémon GO',
  'Pokémon Unite',
  'Honor of Kings',
  'Garena Free Fire',
  'PUBG Mobile',
  'Mobile Legends',
  'Arena of Valor',
  'Brawl Stars',
  'Hay Day',
  'Boom Beach',
  'Candy Crush Saga',
  'Subway Surfers',

  // 🌟 VR GAMES
  'VRChat',
  'Beat Saber',
  'Half-Life: Alyx',
  'Rec Room',
  'Pavlov VR',
  'Blade & Sorcery',
  'Population: One',
  'Gorilla Tag',
  'Boneworks',
  'The Walking Dead: Saints & Sinners',
  'Phasmophobia VR',
  'Among Us VR',

  // 🏮 ASIAN POPULAR
  'Genshin Impact',
  'Honkai: Star Rail',
  'Tower of Fantasy',
  'Blue Protocol',
  'Lost Ark',
  'Black Desert',
  'Blade & Soul',
  'TERA',
  'Aion',
  'Lineage 2M',
  'Ragnarok Online',
  'MapleStory',
  'Dragon Nest',
  'Elsword',
  'Grand Chase',
  'KartRider: Drift',
  'Sudden Attack',
  'CrossFire',
  'Point Blank',
  'Special Force',
  'Combat Arms',
  'Lost Saga',
  'S4 League',
  'Gunbound',
  'Audition Online',
  'O2Jam',
  'Cabal Online',
  'Perfect World',
  'Jade Dynasty',
  'Age of Wushu',
  'Conquer Online',
  'Mu Online',
  'Silkroad Online',
  'Flyff',
  'Mabinogi',
  'Vindictus',
  'Dragon Ball Online',
  'Naruto Online',

  // 🎪 INDIE & UNIQUE
  'Sea of Thieves',
  'Dead by Daylight',
  'Phasmophobia',
  'The Forest',
  'Green Hell',
  'Raft',
  'Valheim',
  'Core Keeper',
  'Risk of Rain 2',
  'Deep Rock Galactic',
  'Warframe',
  'Destiny 2',
  'Monster Hunter: World',
  'Monster Hunter Rise',
  'Nioh 2',
  'Elden Ring',
  'Dark Souls III',
  'Sekiro',
  'Bloodborne',
  'Hollow Knight',
  'Dead Cells',
  'Hades',
  'Stardew Valley',
  'Animal Crossing: New Horizons',
  'The Sims 4',
  'Cities: Skylines',
  'Planet Coaster',
  'Two Point Hospital',
  'Frostpunk',

  // 🌐 BROWSER & IO GAMES
  'Agar.io',
  'Slither.io',
  'Shell Shockers',
  'Krunker.io',
  'Surviv.io',
  'Diep.io',
  'Wings.io',
  'Zombs Royale',
  'Paper.io',
  'Hole.io',
  'Wormate.io',
  'Splix.io',
  'Mope.io',
  'Little Big Snake',
  'Skribbl.io',

  // 🎭 SIMULATION & MANAGEMENT
  'The Sims 4',
  'Cities: Skylines',
  'Planet Coaster',
  'Planet Zoo',
  'Two Point Hospital',
  'Prison Architect',
  'Tropico 6',
  'Anno 1800',
  'Farming Simulator 22',
  'Euro Truck Simulator 2',
  'American Truck Simulator',
  'Microsoft Flight Simulator',
  'Train Sim World',
  'Bus Simulator',

  // 🏛️ CLASSIC & RETRO
  'Counter-Strike 1.6',
  'Counter-Strike: Source',
  'Team Fortress Classic',
  'Half-Life 2: Deathmatch',
  'Quake Champions',
  'Unreal Tournament',
  'Warcraft III',
  'Age of Empires II',
  'Command & Conquer',
  'Red Alert',
  'Diablo II',
  'StarCraft: Brood War',
  'Ultima Online',
  'EverQuest',
  'Dark Age of Camelot',
  "Asheron's Call",
  'Anarchy Online',
  'City of Heroes',

  // 🚀 UPCOMING & EARLY ACCESS
  'Deadlock',
  'Marvel Rivals',
  'XDefiant',
  'The Day Before',
  'Skull and Bones',
  'Avatar: Frontiers of Pandora',
  'Tekken 8',
  'Granblue Fantasy Versus: Rising',
  'Street Fighter 6',
  'Mortal Kombat 1',
  'Guilty Gear Strive',
  'Dragon Ball FighterZ',
  'The King of Fighters XV',
  'Injustice 2',
  'Brawlhalla',
  'MultiVersus',
  'Rivals of Aether',
  'Smash Bros Ultimate',
  'Tekken 7',
  'Soulcalibur VI',

  // 📺 STREAMING & CONTENT
  'Just Chatting',
  'Music',
  'Art',
  'Talk Shows',
  'IRL',
  'Podcasts',
  'Educational',
  'Software Development',
  'Game Development',
  'Digital Art',

  // ✨ OTROS
  'Otro',
  'Custom Game',
  'Homebrew',
  'Mod',
  'Beta Test',
  'Alpha Test',
]
// Lista de sistemas/plataformas para videojuegos online
const SISTEMAS = [
  'PC',
  'PlayStation 5',
  'PlayStation 4',
  'PlayStation 3',
  'PlayStation 2',
  'PlayStation Vita',
  'Xbox Series X',
  'Xbox Series S',
  'Xbox One',
  'Xbox 360',
  'Xbox',
  'Nintendo Switch',
  'Nintendo Wii U',
  'Nintendo Wii',
  'Nintendo 3DS',
  'Nintendo DS',
  'Nintendo DSi',
  'Nintendo GameCube',
  'Nintendo 64',
  'Nintendo Super NES',
  'Nintendo NES',
  'Steam Deck',
  'Android',
  'iOS',
  'Mac',
  'Linux',
  'Web',
  'VR (Oculus/Meta Quest)',
  'VR (HTC Vive)',
  'VR (Valve Index)',
  'VR (PlayStation VR)',
  'Stadia',
  'Amazon Luna',
  'GeForce Now',
  'Shadow',
  'Otro',
]
// Lista extendida de regiones
const REGIONES = [
  'África',
  'Asia',
  'Caribe',
  'Centroamérica',
  'Europa',
  'Latinoamérica',
  'Medio Oriente',
  'Norteamérica',
  'Oceanía',
  'Sudeste Asiático',
  'Suramérica',
  'Antártida',
  'Global',
  'Otro',
]
// Lista de todos los idiomas reconocidos por ISO 639-1
const IDIOMAS = [
  'Afar',
  'Abjasio',
  'Afrikáans',
  'Akan',
  'Albanés',
  'Amárico',
  'Árabe',
  'Aragonés',
  'Armenio',
  'Asamés',
  'Avar',
  'Aymara',
  'Azerí',
  'Bambara',
  'Bielorruso',
  'Bengalí',
  'Bislama',
  'Bosnio',
  'Bretón',
  'Búlgaro',
  'Birmano',
  'Catalán',
  'Chamorro',
  'Checheno',
  'Chichewa',
  'Chino',
  'Chuvasio',
  'Corso',
  'Cree',
  'Croata',
  'Checo',
  'Danés',
  'Divehi',
  'Neerlandés',
  'Dzongkha',
  'Inglés',
  'Esperanto',
  'Estonio',
  'Ewe',
  'Feroés',
  'Fiyiano',
  'Finés',
  'Francés',
  'Fula',
  'Gaélico escocés',
  'Gallego',
  'Ganda',
  'Georgiano',
  'Alemán',
  'Griego',
  'Guaraní',
  'Gujarati',
  'Haitiano',
  'Hausa',
  'Hebreo',
  'Herero',
  'Hindi',
  'Hiri motu',
  'Húngaro',
  'Interlingua',
  'Indonesio',
  'Interlingue',
  'Irlandés',
  'Italiano',
  'Japonés',
  'Javanés',
  'Kalaallisut',
  'Canarés',
  'Kashmiri',
  'Kazajo',
  'Jemer',
  'Kikuyu',
  'Kinyarwanda',
  'Kirguís',
  'Komi',
  'Kongo',
  'Coreano',
  'Kurdo',
  'Lao',
  'Latín',
  'Letón',
  'Limburgués',
  'Lingala',
  'Lituano',
  'Luxemburgués',
  'Macedonio',
  'Malagasy',
  'Malayo',
  'Malayalam',
  'Maltés',
  'Manés',
  'Maorí',
  'Maratí',
  'Marshalés',
  'Mongol',
  'Nauruano',
  'Navajo',
  'Ndonga',
  'Nepalí',
  'Noruego',
  'Nyanja',
  'Occitano',
  'Ojibwa',
  'Oriya',
  'Oromo',
  'Osético',
  'Pali',
  'Pastún',
  'Persa',
  'Polaco',
  'Portugués',
  'Punyabí',
  'Quechua',
  'Romanche',
  'Rumano',
  'Ruso',
  'Samoano',
  'Sango',
  'Sanskrito',
  'Serbio',
  'Shona',
  'Sindhi',
  'Cingalés',
  'Eslovaco',
  'Esloveno',
  'Somalí',
  'Sotho del sur',
  'Español',
  'Sundanés',
  'Suajili',
  'Sueco',
  'Tagalo',
  'Tahitiano',
  'Tayiko',
  'Tamil',
  'Tártaro',
  'Telugú',
  'Tailandés',
  'Tibetano',
  'Tigrinya',
  'Tonga',
  'Tsonga',
  'Tswana',
  'Turco',
  'Turcomano',
  'Twi',
  'Ucraniano',
  'Urdu',
  'Uzbeko',
  'Vietnamita',
  'Volapük',
  'Valón',
  'Galés',
  'Wolof',
  'Xhosa',
  'Yidis',
  'Yoruba',
  'Zhuang',
  'Zulú',
  'Otro',
]
// Lista de todos los países reconocidos por la ONU
const PAISES = [
  'Afganistán',
  'Albania',
  'Alemania',
  'Andorra',
  'Angola',
  'Antigua y Barbuda',
  'Arabia Saudita',
  'Argelia',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaiyán',
  'Bahamas',
  'Bangladés',
  'Barbados',
  'Baréin',
  'Bélgica',
  'Belice',
  'Benín',
  'Bielorrusia',
  'Birmania',
  'Bolivia',
  'Bosnia y Herzegovina',
  'Botsuana',
  'Brasil',
  'Brunéi',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Bután',
  'Cabo Verde',
  'Camboya',
  'Camerún',
  'Canadá',
  'Catar',
  'Chad',
  'Chile',
  'China',
  'Chipre',
  'Colombia',
  'Comoras',
  'Corea del Norte',
  'Corea del Sur',
  'Costa de Marfil',
  'Costa Rica',
  'Croacia',
  'Cuba',
  'Dinamarca',
  'Dominica',
  'Ecuador',
  'Egipto',
  'El Salvador',
  'Emiratos Árabes Unidos',
  'Eritrea',
  'Eslovaquia',
  'Eslovenia',
  'España',
  'Estados Unidos',
  'Estonia',
  'Esuatini',
  'Etiopía',
  'Filipinas',
  'Finlandia',
  'Fiyi',
  'Francia',
  'Gabón',
  'Gambia',
  'Georgia',
  'Ghana',
  'Granada',
  'Grecia',
  'Guatemala',
  'Guyana',
  'Guinea',
  'Guinea-Bisáu',
  'Guinea Ecuatorial',
  'Haití',
  'Honduras',
  'Hungría',
  'India',
  'Indonesia',
  'Irak',
  'Irán',
  'Irlanda',
  'Islandia',
  'Islas Marshall',
  'Islas Salomón',
  'Israel',
  'Italia',
  'Jamaica',
  'Japón',
  'Jordania',
  'Kazajistán',
  'Kenia',
  'Kirguistán',
  'Kiribati',
  'Kuwait',
  'Laos',
  'Lesoto',
  'Letonia',
  'Líbano',
  'Liberia',
  'Libia',
  'Liechtenstein',
  'Lituania',
  'Luxemburgo',
  'Madagascar',
  'Malasia',
  'Malaui',
  'Maldivas',
  'Malí',
  'Malta',
  'Marruecos',
  'Mauricio',
  'Mauritania',
  'México',
  'Micronesia',
  'Moldavia',
  'Mónaco',
  'Mongolia',
  'Montenegro',
  'Mozambique',
  'Namibia',
  'Nauru',
  'Nepal',
  'Nicaragua',
  'Níger',
  'Nigeria',
  'Noruega',
  'Nueva Zelanda',
  'Omán',
  'Países Bajos',
  'Pakistán',
  'Palaos',
  'Palestina',
  'Panamá',
  'Papúa Nueva Guinea',
  'Paraguay',
  'Perú',
  'Polonia',
  'Portugal',
  'Reino Unido',
  'República Centroafricana',
  'República Checa',
  'República del Congo',
  'República Democrática del Congo',
  'República Dominicana',
  'Ruanda',
  'Rumanía',
  'Rusia',
  'Samoa',
  'San Cristóbal y Nieves',
  'San Marino',
  'San Vicente y las Granadinas',
  'Santa Lucía',
  'Santo Tomé y Príncipe',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leona',
  'Singapur',
  'Siria',
  'Somalia',
  'Sri Lanka',
  'Sudáfrica',
  'Sudán',
  'Sudán del Sur',
  'Suecia',
  'Suiza',
  'Surinam',
  'Tailandia',
  'Tanzania',
  'Tayikistán',
  'Timor Oriental',
  'Togo',
  'Tonga',
  'Trinidad y Tobago',
  'Túnez',
  'Turkmenistán',
  'Turquía',
  'Tuvalu',
  'Ucrania',
  'Uganda',
  'Uruguay',
  'Uzbekistán',
  'Vanuatu',
  'Vaticano',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Yibuti',
  'Zambia',
  'Zimbabue',
  'Otro',
]

// Define type for a new room
type NewRoom = {
  nombre: string
  juego: string
  regiones: string[]
  idiomas: string[]
  paises: string[]
  sistemas: string[]
  min_jugadores: number
  max_jugadores: number
  creador_id?: string
}

interface RoomCreatorProps {
  onRoomCreated?: (roomId?: string) => void // Callback para refrescar la lista y opcionalmente redirigir a la sala
}

export default function RoomCreator({ onRoomCreated }: RoomCreatorProps) {
  const { t } = useTranslation(['rooms', 'common'])
  const [form, setForm] = useState<
    Omit<NewRoom, 'id' | 'created_at' | 'creador_id'>
  >({
    nombre: '',
    juego: '',
    regiones: [] as string[], // Align with Supabase schema: regiones instead of region
    idiomas: [] as string[], // Align with Supabase schema: idiomas instead of idioma
    paises: [] as string[], // Align with Supabase schema: paises instead of pais
    sistemas: [] as string[], // Align with Supabase schema: sistemas instead of sistema
    min_jugadores: 2, // Default minimum players
    max_jugadores: 10, // Default maximum players
  })
  const [juegoQuery, setJuegoQuery] = useState('')
  const [paisQuery, setPaisQuery] = useState('')
  const [idiomaQuery, setIdiomaQuery] = useState('')
  const [sistemaQuery, setSistemaQuery] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // Iconos de sistemas
  const sistemaIcon = (s: string) => {
    if (/playstation/i.test(s))
      return (
        <FaPlaystation className="inline text-blue-400" title="PlayStation" />
      )
    if (/xbox/i.test(s))
      return <FaXbox className="inline text-green-400" title="Xbox" />
    if (/pc|windows/i.test(s))
      return <FaWindows className="inline text-blue-200" title="PC" />
    if (/mac/i.test(s))
      return <FaApple className="inline text-gray-200" title="Mac" />
    if (/linux/i.test(s))
      return <FaLinux className="inline text-yellow-200" title="Linux" />
    if (/android/i.test(s))
      return <FaAndroid className="inline text-green-600" title="Android" />
    if (/ios|iphone|ipad/i.test(s))
      return <FaMobileAlt className="inline text-gray-300" title="iOS" />
    if (/switch|nintendo/i.test(s))
      return <FaGamepad className="inline text-red-400" title="Nintendo" />
    if (/steam/i.test(s))
      return <FaSteam className="inline text-blue-400" title="Steam Deck" />
    if (/web|cloud|stadia|luna|geforce|shadow/i.test(s))
      return <FaGlobe className="inline text-violet-400" title="Cloud/Web" />
    if (/vr|oculus|meta|vive|index/i.test(s))
      return <FaGlobe className="inline text-pink-400" title="VR" />
    return <FaQuestion className="inline text-gray-400" title={s} />
  }

  // Bandera de país
  const getFlag = (pais: string) => {
    try {
      const found = countryFlagEmoji.get(pais)
      return found ? found.emoji : '🏳️'
    } catch {
      return '🏳️'
    }
  } // Guardar arrays correctamente en Supabase
  const createRoom = async () => {
    setError('')
    setInfo('')
    if (
      !form.nombre ||
      !form.juego ||
      (form.regiones?.length || 0) === 0 ||
      (form.idiomas?.length || 0) === 0 ||
      (form.sistemas?.length || 0) === 0
    ) {
      setError(t('create.form.validation.nameRequired'))
      return
    }

    // Validate player counts
    if (
      !form.min_jugadores ||
      !form.max_jugadores ||
      form.min_jugadores < 2 ||
      form.max_jugadores < 2 ||
      form.min_jugadores > form.max_jugadores
    ) {
      setError(t('create.form.validation.playersInvalid'))
      return
    }

    console.log('🎯 Iniciando creación de sala...')
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      console.error('❌ Usuario no autenticado')
      setError(t('errors.loginRequired'))
      return
    }

    console.log('✅ Usuario autenticado:', user.data.user.id) // Verificar si ya existe una sala con ese nombre
    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('nombre', form.nombre)
      .maybeSingle()
    if (existing) {
      setError(t('create.form.validation.nameExists'))
      return
    }

    const roomPayload: NewRoom = {
      ...form,
      creador_id: user.data.user.id, // Add creador_id from authenticated user
    }

    console.log('📝 Datos de la sala a insertar:', roomPayload)

    // Insertar la sala con arrays
    const { data: insertedRoom, error: insertError } = await supabase
      .from('rooms')
      .insert(roomPayload)
      .select('id')
      .single()

    if (insertError) {
      console.error('❌ Error al insertar sala:', insertError)
      setError(t('errors.createFailed', { error: insertError.message }))
    } else {
      console.log('✅ Sala creada exitosamente:', insertedRoom)
      setInfo(t('create.success'))
      setForm({
        nombre: '',
        juego: '',
        regiones: [],
        idiomas: [],
        paises: [],
        sistemas: [],
        min_jugadores: 2,
        max_jugadores: 10,
      })

      // Llamar al callback con el ID de la sala creada para auto-redirect
      if (onRoomCreated) {
        onRoomCreated(insertedRoom.id)
      }
    }
  }

  // MultiSelectCombobox reutilizable actualizado
  function MultiSelectCombobox({
    value,
    onChange,
    options,
    placeholder,
  }: {
    value: string[]
    onChange: (v: string[]) => void
    options: string[]
    placeholder: string
  }) {
    const [query, setQuery] = useState('')
    const filteredOptions =
      query === ''
        ? options
        : options.filter((opt) =>
            opt.toLowerCase().includes(query.toLowerCase())
          )
    return (
      <Combobox value={value} onChange={(v) => onChange(v ?? [])} multiple>
        <div className="relative">
          <Combobox.Input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#FFFFFF] focus:outline-0 focus:ring-0 border border-[#303030] bg-[#1A1A1A] focus:border-[#EA2831] h-12 placeholder:text-[#ABABAB] p-[15px] text-base font-normal leading-normal"
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setQuery('')}
          />
          {/* Display selected items as tags */}
          <div className="flex flex-wrap gap-1 p-1">
            {value.map((item) => (
              <span
                key={item}
                className="bg-[#EA2831] text-xs px-2 py-1 rounded-full flex items-center text-[#FFFFFF]"
              >
                {item}
                <button
                  type="button"
                  className="ml-1 text-[#FFFFFF] hover:text-[#ABABAB]"
                  onClick={() => onChange(value.filter((i) => i !== item))}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <Combobox.Options className="absolute z-10 w-full bg-[#212121] border border-[#303030] rounded-xl mt-1 max-h-40 overflow-auto shadow-lg">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-[#ABABAB]">
                {t('search.noResults')}
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <Combobox.Option
                  key={opt}
                  value={opt}
                  className="p-3 hover:bg-[#2A2A2A] cursor-pointer ui-active:bg-[#EA2831] ui-selected:font-semibold text-[#FFFFFF] border-b border-[#303030] last:border-b-0"
                >
                  <span>{opt}</span>
                  {value.includes(opt) && (
                    <span className="ml-2 text-[#EA2831]">✔</span>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-[#212121] p-6 border border-[#303030] max-w-[600px] w-full">
      <h2 className="text-[#FFFFFF] text-lg font-bold leading-tight tracking-[-0.015em] pb-2">
        ➕ Crear Sala
      </h2>

      <div className="flex flex-col gap-4">
        {/* Nombre de la sala */}
        <div className="flex flex-col gap-2">
          <label className="text-[#FFFFFF] text-base font-medium leading-normal">
            Nombre de la sala
          </label>
          <input
            placeholder="Ej: Squad para Ranked"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#FFFFFF] focus:outline-0 focus:ring-0 border border-[#303030] bg-[#1A1A1A] focus:border-[#EA2831] h-12 placeholder:text-[#ABABAB] p-[15px] text-base font-normal leading-normal"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </div>

        {/* Juego */}
        <div className="flex flex-col gap-2">
          <label className="text-[#FFFFFF] text-base font-medium leading-normal">
            Juego
          </label>
          <Combobox
            value={form.juego}
            onChange={(v: string) => setForm((f) => ({ ...f, juego: v ?? '' }))}
          >
            <div className="relative">
              <Combobox.Input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#FFFFFF] focus:outline-0 focus:ring-0 border border-[#303030] bg-[#1A1A1A] focus:border-[#EA2831] h-12 placeholder:text-[#ABABAB] p-[15px] text-base font-normal leading-normal"
                displayValue={(v: string) => v}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setJuegoQuery(e.target.value)
                }
                placeholder="Seleccionar juego"
              />
              <Combobox.Options className="absolute z-10 w-full bg-[#212121] border border-[#303030] rounded-xl mt-1 max-h-40 overflow-auto shadow-lg">
                {(juegoQuery === ''
                  ? JUEGOS
                  : JUEGOS.filter((j) =>
                      j.toLowerCase().includes(juegoQuery.toLowerCase())
                    )
                ).map((j) => (
                  <Combobox.Option
                    key={j}
                    value={j}
                    className="p-3 hover:bg-[#2A2A2A] cursor-pointer ui-active:bg-[#EA2831] ui-selected:font-semibold text-[#FFFFFF] border-b border-[#303030] last:border-b-0"
                  >
                    {j}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Región */}
        <div className="flex flex-col gap-2">
          <label className="text-[#FFFFFF] text-base font-medium leading-normal">
            🌍 Región
          </label>
          <MultiSelectCombobox
            value={form.regiones || []}
            onChange={(v) => setForm((f) => ({ ...f, regiones: v }))}
            options={REGIONES}
            placeholder="Seleccionar región"
          />
        </div>

        {/* Idioma */}
        <div className="flex flex-col gap-2">
          <label className="text-[#FFFFFF] text-base font-medium leading-normal">
            🗣️ Idioma
          </label>
          <MultiSelectCombobox
            value={form.idiomas || []}
            onChange={(v) => setForm((f) => ({ ...f, idiomas: v }))}
            options={IDIOMAS}
            placeholder="Seleccionar idioma"
          />
        </div>

        {/* País (Opcional) */}
        <div className="flex flex-col gap-2">
          <label className="text-[#FFFFFF] text-base font-medium leading-normal">
            🏳️ País <span className="text-[#ABABAB] text-sm">(opcional)</span>
          </label>
          <MultiSelectCombobox
            value={form.paises || []}
            onChange={(v) => setForm((f) => ({ ...f, paises: v }))}
            options={PAISES}
            placeholder="Seleccionar países (opcional)"
          />
        </div>

        {/* Sistema/Plataforma */}
        <div className="flex flex-col gap-2">
          <label className="text-[#FFFFFF] text-base font-medium leading-normal">
            💻 Plataforma
          </label>
          <MultiSelectCombobox
            value={form.sistemas || []}
            onChange={(v) => setForm((f) => ({ ...f, sistemas: v }))}
            options={SISTEMAS}
            placeholder="Seleccionar plataforma"
          />
        </div>

        {/* Player count inputs */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[#FFFFFF] text-base font-medium leading-normal">
            👥 Número de jugadores
            <span
              className="text-[#F59E0B] cursor-help"
              title={t('create.form.tooltips.players')}
            >
              ℹ️
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[#ABABAB] text-sm">Mínimo</span>
              <input
                type="number"
                min="2"
                max="50"
                placeholder="2"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#FFFFFF] focus:outline-0 focus:ring-0 border border-[#303030] bg-[#1A1A1A] focus:border-[#EA2831] h-12 placeholder:text-[#ABABAB] p-[15px] text-base font-normal leading-normal"
                value={form.min_jugadores || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    min_jugadores: e.target.value
                      ? parseInt(e.target.value)
                      : 2,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[#ABABAB] text-sm">Máximo</span>
              <input
                type="number"
                min="2"
                max="50"
                placeholder="10"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#FFFFFF] focus:outline-0 focus:ring-0 border border-[#303030] bg-[#1A1A1A] focus:border-[#EA2831] h-12 placeholder:text-[#ABABAB] p-[15px] text-base font-normal leading-normal"
                value={form.max_jugadores || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_jugadores: e.target.value
                      ? parseInt(e.target.value)
                      : 10,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={createRoom}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 bg-[#EA2831] text-[#FFFFFF] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#D41F28] transition-colors mt-4 w-full"
        >
          <span className="truncate">✨ Crear sala</span>
        </button>

        {/* Error and success messages */}
        {error && (
          <div className="p-3 rounded-xl bg-red-900/20 text-red-300 border border-red-800 text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="p-3 rounded-xl bg-green-900/20 text-green-300 border border-green-800 text-sm">
            {info}
          </div>
        )}
      </div>
    </div>
  )
}

// En la tarjeta de sala:
// <div className="text-sm text-gray-300 flex flex-wrap gap-2 items-center">
//   🎮 {room.juego}
//   | 🌍 {room.region}
//   | 🗣️ {room.idioma}
//   | 🖥️ {room.sistema && <span>{sistemaIcon(room.sistema)} {room.sistema}</span>}
//   {room.pais && <span>| {getFlag(room.pais)} {room.pais}</span>}
// </div>
