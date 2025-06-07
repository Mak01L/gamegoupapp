'use client'
import './globals.css'
import '../lib/i18n' // Inicializar i18next
import Link from 'next/link'
import { useEffect, useState, ReactNode } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import countryFlagEmoji from 'country-flag-emoji';
import { FaWindows, FaPlaystation, FaXbox, FaApple, FaLinux, FaAndroid, FaSteam, FaGlobe, FaMobileAlt, FaGamepad, FaQuestion, FaPlus } from 'react-icons/fa';
import { AuthProvider, useAuth } from '../components/AuthProvider'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../components/LanguageSelector'
import DonationWidget from '../components/DonationWidget'
import SidebarAd from '../components/SidebarAd'
import PlatformStats from '../components/PlatformStats'
import { ADSENSE_CONFIG } from '../lib/adConfig'

type Room = {
  id: string;
  nombre: string;
  juego: string;
  regiones: string[];
  idiomas: string[];
  paises: string[];
  sistemas: string[];
  creador_id?: string; // Using the correct column name from schema
};

function Navbar() {
  const { user, signOut } = useAuth()
  const { t } = useTranslation('common')

  return (
    <nav className="w-full bg-neutral-950 border-b border-violet-700 py-3 px-6 flex gap-6 items-center">
      <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-violet-400">
        <Image 
          src="/logo.png" 
          alt="GameGoUp Logo" 
          width={32} 
          height={32} 
          priority 
          className="w-8 h-8"
        />
        GameGoUp
      </Link>
      {user && (
        <>
          <Link href="/dashboard" className="hover:text-violet-300">{t('navigation.dashboard')}</Link>
          <Link href="/rooms" className="hover:text-violet-300">{t('navigation.rooms')}</Link>
          <Link href="/rooms/create" className="hover:text-violet-300">{t('navigation.createRoom')}</Link>
          <Link href="/profile" className="hover:text-violet-300">{t('navigation.profile')}</Link>
        </>
      )}
      <div className="ml-auto flex items-center gap-4">
        <LanguageSelector />
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{t('greeting.hello', { name: user.user_metadata?.username || user.email?.split('@')[0] })}</span>
            <button 
              onClick={signOut} 
              className="hover:text-red-400 transition-colors"
            >
              {t('navigation.logout')}
            </button>
          </div>
        ) : (
          <Link href="/auth" className="hover:text-red-400">{t('navigation.login', 'Iniciar sesión')}</Link>
        )}
      </div>
    </nav>
  )
}

function sistemaIcon(s: string) {
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
}
function getFlag(pais: string) {
  try {
    const found = countryFlagEmoji.get(pais);
    return found ? found.emoji : '🏳️';
  } catch {
    return '🏳️';
  }
}

function SidebarRooms() {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRooms() {
      if (!user) {
        setRooms([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      console.log('Fetching rooms for user:', user.id);
      
      const { data, error: dbError } = await supabase
        .from('rooms')
        .select('*')
        .eq('creador_id', user.id); // Using the correct column name from schema

      if (dbError) {
        console.error('Error fetching user rooms:', dbError);
        setError(t('sidebar.loadError'));
        setRooms([]);
      } else if (data) {
        console.log('Fetched rooms:', data);
        setRooms(data as Room[]); // Aseguramos el tipo aquí
      }
      setLoading(false);
    }

    if (user) {
      fetchUserRooms();
      
      // Configurar suscripción en tiempo real para auto-actualización
      const channel = supabase
        .channel(`user_rooms_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Escuchar INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'rooms',
            filter: `creador_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔄 Cambio detectado en las salas del usuario:', payload)
            // Refrescar las salas cuando hay cambios
            fetchUserRooms()
          }
        )
        .subscribe()

      // Cleanup de la suscripción
      return () => {
        channel.unsubscribe()
      }
    } else {
      setRooms([]);
      setLoading(false);
    }
  }, [user]);

  // Función para salir de una sala - definida dentro del useEffect
  const handleLeaveRoom = async (roomId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación del Link
    e.stopPropagation();
    
    if (!user) return;
    
    try {
      // Verificar si estamos actualmente en esta sala
      const isInRoom = pathname === `/room/${roomId}`;
      
      // Usar la función de PostgreSQL para salir de forma segura
      const { data, error } = await supabase
        .rpc('leave_room_safely', {
          room_id_param: roomId,
          user_id_param: user.id
        });

      if (error) {
        console.error('Error al salir de la sala:', error);
        // Fallback: marcar como inactivo manualmente
        await supabase
          .from('room_users')
          .update({ 
            is_active: false,
            last_seen: new Date().toISOString()
          })
          .eq('room_id', roomId)
          .eq('user_id', user.id);
      } else {
        console.log('Resultado al salir:', data);
        if (data?.room_deleted) {
          console.log('Sala eliminada automáticamente por estar vacía');
        }
      }
      
      // Si estamos en la sala, redirigir al listado de salas
      if (isInRoom) {
        router.push('/rooms');
      }
      
      // Refrescar la lista de salas
      const { data: updatedRooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('creador_id', user.id);
      
      if (updatedRooms) {
        setRooms(updatedRooms as Room[]);
      }
      
    } catch (err) {
      console.error('Error inesperado al salir:', err);
    }
  };

  return (
    <aside className="w-64 bg-neutral-950 border-r border-violet-700 h-screen p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-violet-400 font-bold flex items-center gap-2">
          <span>🎮</span> {t('sidebar.yourRooms')}
        </span>
        <Link href="/rooms/create" className="text-violet-300 hover:text-violet-100 text-lg" title={t('sidebar.createNewRoom')}><FaPlus /></Link>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {loading && <div className="text-gray-500 text-sm">{t('sidebar.loading')}</div>}
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {!loading && !error && rooms.length === 0 && <div className="text-gray-500 text-sm">{t('sidebar.noRoomsCreated')} <Link href="/rooms/create" className="text-violet-400 hover:underline">{t('sidebar.createFirst')}</Link></div>}
        {!loading && !error && rooms.map(room => (
          <div key={room.id} className="flex items-center gap-1 p-2 rounded border border-violet-700 hover:bg-violet-800/30 group">
            <Link href={`/room/${room.id}`} className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-semibold truncate max-w-[70px]" title={room.nombre}>{room.nombre}</span>
              {/* Iconos de sistemas */}
              {room.sistemas && room.sistemas.slice(0, 2).map(s => <span key={s}>{sistemaIcon(s)}</span>)}
              {/* Banderas de país */}
              {room.paises && room.paises.slice(0, 2).map(p => <span key={p}>{getFlag(p)}</span>)}
            </Link>
            {/* Botón de salir */}
            <button
              onClick={(e) => handleLeaveRoom(room.id, e)}
              className="text-red-500 hover:text-red-400 hover:bg-red-900/30 text-sm p-1 rounded transition-all duration-200 font-bold"
              title={t('leaveRoom')}
            >
              🚪
            </button>
          </div>
        ))}
      </div>
      
      {/* Platform Stats - Compact Version */}
      <div className="mt-4 mb-2">
        <PlatformStats className="text-xs" />
      </div>
      
      <SidebarAd className="mt-2" />
      <DonationWidget variant="minimal" className="border-t border-violet-800 pt-2" />
      <div className="border-t border-violet-800 mt-2 pt-2 text-xs text-gray-500 text-center">GameGoUp © {new Date().getFullYear()}</div>
    </aside>
  )
}

function LayoutContent({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <div className="flex w-full min-h-screen">
        {user && <SidebarRooms />}
        <main className={`flex flex-col flex-1 relative ${user ? '' : 'items-center justify-center'}`}>
          {children}
        </main>
      </div>
    </>
  )
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script 
          async 
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-black text-white">
        <AuthProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </AuthProvider>
      </body>
    </html>
  )
}
