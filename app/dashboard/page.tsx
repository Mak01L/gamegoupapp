// app/dashboard/page.tsx
"use client";

import { useAuth } from '../../components/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import DonationWidget from '../../components/DonationWidget';
import AdManager from '../../components/AdManager';
import CommunityHub from '../../components/CommunityHub';
import { getAdConfig } from '../../lib/adConfig';

interface Room {
  id: string;
  nombre: string;
  juego: string;
  regiones: string[];
  idiomas: string[];
  paises: string[];
  sistemas: string[];
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation(['common', 'dashboard']);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalMessages: 0,
    activeRooms: 0
  });
  
  // Obtener configuración de anuncio para banner
  const bannerAdConfig = getAdConfig('banner');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Obtener salas del usuario
      const { data: userRooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('creador_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
      } else {
        setRecentRooms(userRooms || []);
      }

      // Obtener estadísticas básicas
      const { count: totalRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('creador_id', user.id);

      setStats(prev => ({
        ...prev,
        totalRooms: totalRooms || 0,
        activeRooms: userRooms?.length || 0
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mb-4"></div>
        <p className="text-gray-300">{t('loading.dashboard')}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full p-8">
      <div className="max-w-6xl mx-auto">        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t('dashboard.welcomeBack', { name: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Gamer' })} 🎮
            </h1>
            <p className="text-gray-400 text-lg">
              {t('dashboard.welcomeDescription')}
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Image 
              src="/logo.png" 
              alt="GameGoUp Logo" 
              width={80} 
              height={80} 
              className="w-20 h-20 opacity-80"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-900 border border-violet-700 rounded-xl p-6 text-center">            <div className="text-3xl font-bold text-violet-400 mb-2">{stats.totalRooms}</div>
            <div className="text-gray-300">{t('dashboard.statsCards.roomsCreated')}</div>
          </div>
          <div className="bg-neutral-900 border border-violet-700 rounded-xl p-6 text-center">            <div className="text-3xl font-bold text-green-400 mb-2">{stats.activeRooms}</div>
            <div className="text-gray-300">{t('dashboard.statsCards.activeRooms')}</div>
          </div>
          <div className="bg-neutral-900 border border-violet-700 rounded-xl p-6 text-center">            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalMessages}</div>
            <div className="text-gray-300">{t('dashboard.statsCards.messagesSent')}</div>          </div>
        </div>        {/* Subtle Ad Banner */}
        <AdManager 
          variant="banner" 
          adSlot={bannerAdConfig.slot}
          className="mb-8"
          fallbackAd={bannerAdConfig.fallback}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"><Link 
            href="/rooms/create" 
            className="bg-violet-600 hover:bg-violet-700 rounded-xl p-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🆕</div>
            <div className="font-semibold">{t('dashboard.quickActions.createRoom')}</div>
          </Link>
          <Link 
            href="/rooms" 
            className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔍</div>
            <div className="font-semibold">{t('dashboard.quickActions.searchRooms')}</div>
          </Link>
          <Link 
            href="/profile" 
            className="bg-green-600 hover:bg-green-700 rounded-xl p-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👤</div>
            <div className="font-semibold">{t('dashboard.quickActions.myProfile')}</div>
          </Link>
          <div className="bg-orange-600 hover:bg-orange-700 rounded-xl p-4 text-center transition-colors group cursor-pointer">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
            <div className="font-semibold">{t('dashboard.quickActions.achievements')}</div>
          </div>
          <DonationWidget variant="button" />
        </div>

        {/* Recent Rooms */}
        <div className="bg-neutral-900 border border-violet-700 rounded-xl p-6">          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-violet-400">{t('dashboard.recentRooms.title')}</h2>
            <Link 
              href="/rooms" 
              className="text-violet-300 hover:text-violet-100 text-sm"
            >
              {t('dashboard.recentRooms.viewAll')}
            </Link>
          </div>
            {recentRooms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 opacity-50">🎮</div>
              <p className="text-gray-400 mb-4">{t('dashboard.recentRooms.noRoomsYet')}</p>
              <Link 
                href="/rooms/create" 
                className="inline-block bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl text-white font-semibold transition-colors"
              >
                {t('dashboard.recentRooms.createFirstRoom')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentRooms.map((room) => (
                <Link 
                  key={room.id} 
                  href={`/room/${room.id}`}
                  className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg p-4 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                      {room.nombre}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {new Date(room.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 truncate">{room.juego}</p>
                  <div className="flex items-center gap-2">
                    {room.paises && room.paises.slice(0, 3).map((pais, i) => (
                      <span key={i} className="text-xs bg-neutral-700 px-2 py-1 rounded">
                        {pais}
                      </span>
                    ))}
                    {room.paises && room.paises.length > 3 && (
                      <span className="text-xs text-gray-400">+{room.paises.length - 3}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>          )}
        </div>

        {/* Community & Support Section */}
        <CommunityHub className="mt-8" />
      </div>
    </main>
  );
}
