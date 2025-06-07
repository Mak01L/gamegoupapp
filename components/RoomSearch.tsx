'use client'

// Validaciones avanzadas y favoritos en RoomSearch
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Combobox } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import countryFlagEmoji from 'country-flag-emoji';
import { FaWindows, FaPlaystation, FaXbox, FaApple, FaLinux, FaAndroid, FaSteam, FaGlobe, FaMobileAlt, FaGamepad, FaQuestion } from 'react-icons/fa';

// Lista extendida de juegos online populares
const JUEGOS = [
  'Apex Legends', 'Minecraft', 'Valorant', 'League of Legends', 'Fortnite', 'Counter-Strike', 'Rocket League', 'Call of Duty', 'PUBG', 'Overwatch', 'Dota 2', 'Genshin Impact', 'Roblox', 'Among Us', 'Grand Theft Auto V', 'FIFA', 'NBA 2K', 'Rainbow Six Siege', 'The Sims', 'World of Warcraft', 'Hearthstone', 'Destiny 2', 'Elden Ring', 'Lost Ark', 'ARK: Survival Evolved', 'Rust', 'Escape from Tarkov', 'Team Fortress 2', 'Paladins', 'Smite', 'Brawlhalla', 'Warframe', 'Sea of Thieves', 'Fall Guys', 'Dead by Daylight', 'Monster Hunter', 'Pokémon Unite', 'Mobile Legends', 'Clash Royale', 'Clash of Clans', 'Free Fire', 'Arena of Valor', 'Wild Rift', 'Stumble Guys', 'Diablo IV', 'Star Wars Battlefront', 'Battlefield', 'Halo', 'Left 4 Dead', 'Payday 2', 'Terraria', 'Stardew Valley', 'Phasmophobia', 'Valorant', 'Lost Ark', 'New World', 'Forza Horizon', 'Gran Turismo', 'Mario Kart', 'Super Smash Bros', 'Splatoon', 'Animal Crossing', 'Pokémon GO', 'Zelda: Breath of the Wild', 'Metin2', 'Tibia', 'RuneScape', 'MapleStory', 'Guild Wars 2', 'Final Fantasy XIV', 'Black Desert', 'Blade & Soul', 'Crossfire', 'Point Blank', 'War Thunder', 'World of Tanks', 'World of Warships', 'PlanetSide 2', 'EVE Online', 'Second Life', 'VRChat', 'Beat Saber', 'Rec Room', 'No Man’s Sky', 'Among Us VR', 'Hunt: Showdown 1896', 'Gray Zone Warfare', 'Dark and Darker', 'Lost Saga', 'Combat Arms', 'Sudden Attack', 'KartRider', 'Mabinogi', 'Flyff', 'Cabal Online', 'Perfect World', 'Dragon Nest', 'Elsword', 'Grand Chase', 'Ragnarok Online', 'Mu Online', 'Lineage II', 'Aion', 'Tera', 'Blade & Soul', 'S4 League', 'Point Blank', 'Special Force', 'Audition Online', 'Gunbound', 'Dofus', 'Wakfu', 'Trove', 'Skyforge', 'Dauntless', 'Albion Online', 'Conqueror’s Blade', 'Lost Ark', 'Crucible', 'Spellbreak', 'Hyper Scape', 'Splitgate', 'Enlisted', 'World War 3', 'Super People', 'The Cycle: Frontier', 'V Rising', 'Project Zomboid', 'Unturned', 'Scum', 'DayZ', 'MORDHAU', 'Chivalry 2', 'For Honor', 'Mortal Online 2', 'Crowfall', 'Camelot Unchained', 'Ashes of Creation', 'Blue Protocol', 'Tower of Fantasy', 'Gran Saga', 'Otro'
]
// Lista de sistemas/plataformas para videojuegos online
const SISTEMAS = [
  'PC', 'PlayStation 5', 'PlayStation 4', 'PlayStation 3', 'PlayStation 2', 'PlayStation Vita', 'Xbox Series X', 'Xbox Series S', 'Xbox One', 'Xbox 360', 'Xbox', 'Nintendo Switch', 'Nintendo Wii U', 'Nintendo Wii', 'Nintendo 3DS', 'Nintendo DS', 'Nintendo DSi', 'Nintendo GameCube', 'Nintendo 64', 'Nintendo Super NES', 'Nintendo NES', 'Steam Deck', 'Android', 'iOS', 'Mac', 'Linux', 'Web', 'VR (Oculus/Meta Quest)', 'VR (HTC Vive)', 'VR (Valve Index)', 'VR (PlayStation VR)', 'Stadia', 'Amazon Luna', 'GeForce Now', 'Shadow', 'Otro'
]
// Lista extendida de regiones
const REGIONES = [
  'África', 'Asia', 'Caribe', 'Centroamérica', 'Europa', 'Latinoamérica', 'Medio Oriente', 'Norteamérica', 'Oceanía', 'Sudeste Asiático', 'Suramérica', 'Antártida', 'Global', 'Otro'
]
// Lista de todos los idiomas reconocidos por ISO 639-1
const IDIOMAS = [
  'Español',
  'Afar', 'Abjasio', 'Afrikáans', 'Akan', 'Albanés', 'Amárico', 'Árabe', 'Aragonés', 'Armenio', 'Asamés', 'Avar', 'Aymara', 'Azerí', 'Bambara', 'Bielorruso', 'Bengalí', 'Bislama', 'Bosnio', 'Bretón', 'Búlgaro', 'Birmano', 'Catalán', 'Chamorro', 'Checheno', 'Chichewa', 'Chino', 'Chuvasio', 'Corso', 'Cree', 'Croata', 'Checo', 'Danés', 'Divehi', 'Neerlandés', 'Dzongkha', 'Inglés', 'Esperanto', 'Estonio', 'Ewe', 'Feroés', 'Fiyiano', 'Finés', 'Francés', 'Fula', 'Gaélico escocés', 'Gallego', 'Ganda', 'Georgiano', 'Alemán', 'Griego', 'Guaraní', 'Gujarati', 'Haitiano', 'Hausa', 'Hebreo', 'Herero', 'Hindi', 'Hiri motu', 'Húngaro', 'Interlingua', 'Indonesio', 'Interlingue', 'Irlandés', 'Italiano', 'Japonés', 'Javanés', 'Kalaallisut', 'Canarés', 'Kashmiri', 'Kazajo', 'Jemer', 'Kikuyu', 'Kinyarwanda', 'Kirguís', 'Komi', 'Kongo', 'Coreano', 'Kurdo', 'Lao', 'Latín', 'Letón', 'Limburgués', 'Lingala', 'Lituano', 'Luxemburgués', 'Macedonio', 'Malagasy', 'Malayo', 'Malayalam', 'Maltés', 'Manés', 'Maorí', 'Maratí', 'Marshalés', 'Mongol', 'Nauruano', 'Navajo', 'Ndonga', 'Nepalí', 'Noruego', 'Nyanja', 'Occitano', 'Ojibwa', 'Oriya', 'Oromo', 'Osético', 'Pali', 'Pastún', 'Persa', 'Polaco', 'Portugués', 'Punyabí', 'Quechua', 'Romanche', 'Rumano', 'Ruso', 'Samoano', 'Sango', 'Sanskrito', 'Serbio', 'Shona', 'Sindhi', 'Cingalés', 'Eslovaco', 'Esloveno', 'Somalí', 'Sotho del sur', 'Sundanés', 'Suajili', 'Sueco', 'Tagalo', 'Tahitiano', 'Tayiko', 'Tamil', 'Tártaro', 'Telugú', 'Tailandés', 'Tibetano', 'Tigrinya', 'Tonga', 'Tsonga', 'Tswana', 'Turco', 'Turcomano', 'Twi', 'Ucraniano', 'Urdu', 'Uzbeko', 'Vietnamita', 'Volapük', 'Valón', 'Galés', 'Wolof', 'Xhosa', 'Yidis', 'Yoruba', 'Zhuang', 'Zulú', 'Otro'
]
// Lista de todos los países reconocidos por la ONU (agregando Uruguay y países pequeños)
const PAISES = [
  'Uruguay', 'Andorra', 'Liechtenstein', 'San Marino', 'Mónaco', 'Vaticano', 'Malta', 'Luxemburgo', 'Barbados', 'Antigua y Barbuda', 'San Cristóbal y Nieves', 'San Vicente y las Granadinas', 'Santa Lucía', 'Dominica', 'Granada', 'Seychelles', 'Comoras', 'Santo Tomé y Príncipe', 'Palaos', 'Nauru', 'Tuvalu', 'Micronesia', 'Islas Marshall', 'Kiribati',
  'Afganistán', 'Albania', 'Alemania', 'Angola', 'Arabia Saudita', 'Argelia', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaiyán', 'Bahamas', 'Bangladés', 'Baréin', 'Bélgica', 'Belice', 'Benín', 'Bielorrusia', 'Birmania', 'Bolivia', 'Bosnia y Herzegovina', 'Botsuana', 'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Bután', 'Cabo Verde', 'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad', 'Chile', 'China', 'Chipre', 'Colombia', 'Corea del Norte', 'Corea del Sur', 'Costa de Marfil', 'Costa Rica', 'Croacia', 'Cuba', 'Dinamarca', 'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos', 'Eritrea', 'Eslovaquia', 'Eslovenia', 'España', 'Estados Unidos', 'Estonia', 'Esuatini', 'Etiopía', 'Filipinas', 'Finlandia', 'Fiyi', 'Francia', 'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Grecia', 'Guatemala', 'Guyana', 'Guinea', 'Guinea-Bisáu', 'Guinea Ecuatorial', 'Haití', 'Honduras', 'Hungría', 'India', 'Indonesia', 'Irak', 'Irán', 'Irlanda', 'Islandia', 'Israel', 'Italia', 'Jamaica', 'Japón', 'Jordania', 'Kazajistán', 'Kenia', 'Kirguistán', 'Kuwait', 'Laos', 'Lesoto', 'Letonia', 'Líbano', 'Liberia', 'Libia', 'Lituania', 'Madagascar', 'Malasia', 'Malaui', 'Maldivas', 'Malí', 'Marruecos', 'Mauricio', 'Mauritania', 'México', 'Moldavia', 'Mongolia', 'Montenegro', 'Mozambique', 'Namibia', 'Nepal', 'Nicaragua', 'Níger', 'Nigeria', 'Noruega', 'Nueva Zelanda', 'Omán', 'Países Bajos', 'Pakistán', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Polonia', 'Portugal', 'Reino Unido', 'República Centroafricana', 'República Checa', 'República del Congo', 'República Democrática del Congo', 'República Dominicana', 'Ruanda', 'Rumanía', 'Rusia', 'Samoa', 'Senegal', 'Serbia', 'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka', 'Sudáfrica', 'Sudán', 'Sudán del Sur', 'Suecia', 'Suiza', 'Surinam', 'Tailandia', 'Tanzania', 'Tayikistán', 'Timor Oriental', 'Togo', 'Tonga', 'Trinidad y Tobago', 'Túnez', 'Turkmenistán', 'Turquía', 'Ucrania', 'Uganda', 'Uzbekistán', 'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Yibuti', 'Zambia', 'Zimbabue', 'Otro'
]

function getFavorites(key: string): string[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function setFavorites(key: string, arr: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(arr));
}

interface Room {
  id: string
  nombre: string
  juego: string
  regiones: string[] // Fix: regiones array
  idiomas: string[]  // Fix: idiomas array
  paises: string[]   // Fix: paises array
  sistemas: string[] // Fix: sistemas array
  min_jugadores?: number
  max_jugadores?: number
  creador_id: string
  created_at: string
}

export default function RoomSearch() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filters, setFilters] = useState({
    juego: '',
    region: [] as string[],
    idioma: '',
    pais: [] as string[],
    sistema: '',
    texto: ''
  })
  const [juegoQuery, setJuegoQuery] = useState('')
  const [paisQuery, setPaisQuery] = useState('')
  const [idiomaQuery, setIdiomaQuery] = useState('')
  const [sistemaQuery, setSistemaQuery] = useState('')
  const [searchText, setSearchText] = useState('')
  const [favoriteJuegos, setFavoriteJuegos] = useState<string[]>(getFavorites('fav_juegos'));
  const [favoriteSistemas, setFavoriteSistemas] = useState<string[]>(getFavorites('fav_sistemas'));
  const [favoriteSalas, setFavoriteSalas] = useState<string[]>(getFavorites('fav_salas'));
  const router = useRouter();

  const filteredJuegos = juegoQuery === '' ? JUEGOS : JUEGOS.filter(j => j.toLowerCase().includes(juegoQuery.toLowerCase()))
  const filteredPaises = paisQuery === '' ? PAISES : PAISES.filter(p => p.toLowerCase().includes(paisQuery.toLowerCase()))
  const filteredIdiomas = idiomaQuery === '' ? IDIOMAS : IDIOMAS.filter(i => i.toLowerCase().includes(idiomaQuery.toLowerCase()))
  const filteredSistemas = sistemaQuery === '' ? SISTEMAS : SISTEMAS.filter(s => s.toLowerCase().includes(sistemaQuery.toLowerCase()))

  // Ordenar juegos y sistemas favoritos primero
  const orderedJuegos = [...favoriteJuegos, ...JUEGOS.filter(j => !favoriteJuegos.includes(j))];
  const orderedSistemas = [...favoriteSistemas, ...SISTEMAS.filter(s => !favoriteSistemas.includes(s))];

  // Buscar usando arrays en Supabase
  const fetchRooms = async () => {
    console.log('🔍 Buscando salas con filtros:', filters, 'texto:', searchText);
    let query = supabase.from('rooms').select('*');
    if (filters.juego) query = query.eq('juego', filters.juego);
    if (filters.region.length > 0) query = query.overlaps('regiones', filters.region); // Fix: regiones
    if (filters.idioma.length > 0) query = query.overlaps('idiomas', filters.idioma); // Fix: idiomas
    if (filters.pais.length > 0) query = query.overlaps('paises', filters.pais); // Fix: paises
    if (filters.sistema.length > 0) query = query.overlaps('sistemas', filters.sistema); // Fix: sistemas
    if (searchText) query = query.ilike('nombre', `%${searchText}%`);
    const { data, error } = await query;
    console.log('📊 Resultado de búsqueda:', { data, error });
    if (!error) setRooms(data || []);
    else console.error('❌ Error al buscar salas:', error);
  }

  useEffect(() => {
    fetchRooms()
  }, [filters, searchText])

  // Favoritos handlers
  const toggleFavoriteJuego = (j: string) => {
    let favs = [...favoriteJuegos];
    if (favs.includes(j)) favs = favs.filter(f => f !== j);
    else favs.push(j);
    setFavoriteJuegos(favs);
    setFavorites('fav_juegos', favs);
  };
  const toggleFavoriteSistema = (s: string) => {
    let favs = [...favoriteSistemas];
    if (favs.includes(s)) favs = favs.filter(f => f !== s);
    else favs.push(s);
    setFavoriteSistemas(favs);
    setFavorites('fav_sistemas', favs);
  };
  const toggleFavoriteSala = (id: string) => {
    let favs = [...favoriteSalas];
    if (favs.includes(id)) favs = favs.filter(f => f !== id);
    else favs.push(id);
    setFavoriteSalas(favs);
    setFavorites('fav_salas', favs);
  };

  // Iconos de sistemas
  const sistemaIcon = (s: string) => {
    if (/playstation/i.test(s)) return <FaPlaystation className="inline text-blue-400" title="PlayStation" />;
    if (/xbox/i.test(s)) return <FaXbox className="inline text-green-400" title="Xbox" />;
    if (/pc|windows/i.test(s)) return <FaWindows className="inline text-blue-200" title="PC" />;
    if (/mac/i.test(s)) return <FaApple className="inline text-gray-200" title="Mac" />;
    if (/linux/i.test(s)) return <FaLinux className="inline text-yellow-200" title="Linux" />;
    if (/android/i.test(s)) return <FaAndroid className="inline text-green-600" title="Android" />;
    if (/ios|iphone|ipad/i.test(s)) return <FaMobileAlt className="inline text-gray-300" title="iOS" />;
    if (/switch|nintendo/i.test(s)) return <FaGamepad className="inline text-red-400" title="Nintendo" />;
    if (/steam/i.test(s)) return <FaSteam className="inline text-blue-400" title="Steam Deck" />;
    if (/web|cloud|stadia|luna|geforce|shadow/i.test(s)) return <FaGlobe className="inline text-violet-400" title="Cloud/Web" />;
    if (/vr|oculus|meta|vive|index/i.test(s)) return <FaGlobe className="inline text-pink-400" title="VR" />;
    return <FaQuestion className="inline text-gray-400" title={s} />;
  };

  // Bandera de país
  const getFlag = (pais: string) => {
    try {
      const found = countryFlagEmoji.get(pais);
      return found ? found.emoji : '🏳️';
    } catch {
      return '🏳️';
    }
  };

  // Filtros con búsqueda dinámica para MultiSelectCombobox
  function MultiSelectCombobox({ value, onChange, options, placeholder }: { value: string[], onChange: (v: string[]) => void, options: string[], placeholder: string }) {
    const [query, setQuery] = useState('');
    const filteredOptions = query === ''
      ? options
      : options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));
    return (
      <Combobox value={value} onChange={v => onChange(v ?? [])} multiple>
        <div className="relative">
          <div className="p-2 w-full bg-black border border-violet-500 rounded-xl flex flex-wrap gap-1 min-h-[40px] items-center">
            {value.length > 0 ? (
              value.map(v => (
                <span key={v} className="bg-violet-700 text-xs px-2 py-1 rounded-md flex items-center">
                  {v}
                  <button 
                    type="button" 
                    className="ml-1 text-violet-300 hover:text-white"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onChange(value.filter(i => i !== v)); 
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <Combobox.Input
              className="bg-transparent flex-grow outline-none text-white placeholder-gray-500 min-w-[100px] p-1"
              placeholder={value.length > 0 ? "" : placeholder} 
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setQuery('')} 
            />
          </div>
          <Combobox.Options className="absolute z-10 w-full bg-black border border-violet-500 rounded-xl mt-1 max-h-40 overflow-auto">
            {filteredOptions.map(opt => (
              <Combobox.Option key={opt} value={opt} className="p-2 hover:bg-violet-700 cursor-pointer flex justify-between items-center">
                <span>{opt}</span>
                {value.includes(opt) && <span className="ml-2 text-violet-400">✔</span>}
              </Combobox.Option>
            ))}
            {filteredOptions.length === 0 && query !== '' && (
              <div className="p-2 text-gray-500">No se encontraron opciones.</div>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    )
  }

  return (
    <div className="p-4 text-white w-full max-w-xl mx-auto">
      <h2 className="text-2xl mb-4">🔍 Buscar Salas</h2>
      <input
        type="text"
        placeholder="Buscar por nombre de sala..."
        className="mb-4 p-2 w-full bg-black border border-violet-500 rounded-xl"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Juego combobox con favoritos */}
        <Combobox value={filters.juego} onChange={(v: string) => setFilters(f => ({ ...f, juego: v }))}>
          <div className="relative">
            <Combobox.Input
              className="p-2 w-full bg-black border border-violet-500 rounded-xl"
              displayValue={(v: string) => v}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJuegoQuery(e.target.value)}
              placeholder="Juego"
            />
            <Combobox.Options className="absolute z-10 w-full bg-black border border-violet-500 rounded-xl mt-1 max-h-40 overflow-auto">
              {orderedJuegos.filter(j => juegoQuery === '' || j.toLowerCase().includes(juegoQuery.toLowerCase())).map(j => (
                <Combobox.Option key={j} value={j} className="p-2 flex items-center gap-2 hover:bg-violet-700 cursor-pointer">
                  <span>{j}</span>
                  <button type="button" className="ml-auto text-yellow-400" onClick={e => { e.stopPropagation(); toggleFavoriteJuego(j); }}>
                    {favoriteJuegos.includes(j) ? '★' : '☆'}
                  </button>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>
        {/* Región multi-select */}
        <MultiSelectCombobox value={filters.region} onChange={v => setFilters(f => ({ ...f, region: v }))} options={REGIONES} placeholder="Región" />
        {/* Idioma combobox */}
        <Combobox value={filters.idioma} onChange={(v: string | null) => setFilters(f => ({ ...f, idioma: v || '' }))}>
          <div className="relative">
            <Combobox.Input
              className="p-2 w-full bg-black border border-violet-500 rounded-xl"
              displayValue={(v: string) => v}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdiomaQuery(e.target.value)}
              placeholder="Idioma"
            />
            <Combobox.Options className="absolute z-10 w-full bg-black border border-violet-500 rounded-xl mt-1 max-h-40 overflow-auto">
              {filteredIdiomas.map(i => (
                <Combobox.Option key={i} value={i} className="p-2 hover:bg-violet-700 cursor-pointer">{i}</Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>
        {/* País multi-select */}
        <MultiSelectCombobox value={filters.pais} onChange={v => setFilters(f => ({ ...f, pais: v }))} options={PAISES} placeholder="País" />
        {/* Sistema combobox con favoritos */}
        <Combobox value={filters.sistema} onChange={(v: string) => setFilters(f => ({ ...f, sistema: v }))}>
          <div className="relative">
            <Combobox.Input
              className="p-2 w-full bg-black border border-violet-500 rounded-xl"
              displayValue={(v: string) => v}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSistemaQuery(e.target.value)}
              placeholder="Sistema"
            />
            <Combobox.Options className="absolute z-10 w-full bg-black border border-violet-500 rounded-xl mt-1 max-h-40 overflow-auto">
              {orderedSistemas.filter(s => sistemaQuery === '' || s.toLowerCase().includes(sistemaQuery.toLowerCase())).map(s => (
                <Combobox.Option key={s} value={s} className="p-2 flex items-center gap-2 hover:bg-violet-700 cursor-pointer">
                  <span>{s}</span>
                  <button type="button" className="ml-auto text-yellow-400" onClick={e => { e.stopPropagation(); toggleFavoriteSistema(s); }}>
                    {favoriteSistemas.includes(s) ? '★' : '☆'}
                  </button>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>
      {/* Ordenar y paginar resultados */}
      <div className="flex gap-2 mb-2">
        <select title="Ordenar por" className="p-2 rounded bg-black border border-violet-500" onChange={e => setFilters(f => ({ ...f, order: e.target.value }))}>
          <option value="">Ordenar por</option>
          <option value="nombre">Nombre</option>
          <option value="juego">Juego</option>
          <option value="pais">País</option>
        </select>
      </div>
      <div className="grid gap-2">
        {rooms.slice(0, 20).map((room) => (
          <div key={room.id} className="p-4 bg-violet-800/20 border border-violet-500 rounded-xl relative">
            <div className="text-lg font-bold flex items-center gap-2">
              {room.nombre}
              <button type="button" className="text-yellow-400" onClick={() => toggleFavoriteSala(room.id)}>
                {favoriteSalas.includes(room.id) ? '★' : '☆'}
              </button>
            </div>
            <div className="text-sm text-gray-300 flex flex-wrap gap-2 items-center">
              🎮 {room.juego}
              | 🌍 {room.regiones?.join(', ')}
              | 🗣️ {room.idiomas?.join(', ')}
              | 💻 {room.sistemas?.join(', ')}
              | 🏳️ {room.paises?.join(', ')}
            </div>
            {/* Mostrar fecha de creación */}
            <div className="text-xs text-gray-500 mt-1">
              Creado: {new Date(room.created_at).toLocaleDateString()}
            </div>
            <button 
              className="mt-2 px-4 py-1 bg-violet-600 hover:bg-violet-700 rounded-xl text-white"
              onClick={() => router.push(`/room/${room.id}`)}
            >
              🚪 Entrar a la sala
            </button>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="text-center text-gray-400">No se encontraron salas con esos filtros.</div>
        )}
      </div>
      {/* Paginación simple */}
      {/* Si hay más de 20 resultados, mostrar botón para cargar más */}
      {rooms.length > 20 && (
        <button className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl" onClick={() => {/* lógica de paginación aquí */}}>
          Cargar más
        </button>
      )}
      {/* Validación visual en el creador de salas */}
      {/* {error && <div className="text-red-400 text-sm">{error}</div>}
      {info && <div className="text-green-400 text-sm">{info}</div>} */}
      {/* Multi-select para sistemas e idiomas en RoomCreator (usa un Combobox con múltiples valores seleccionados) */}
    </div>
  )
}
