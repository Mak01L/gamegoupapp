import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

// Define Room type directly without importing Database
type Room = {
  id: string;
  nombre: string;
  juego: string;
  regiones?: string[];
  idiomas?: string[];
  sistemas?: string[];
  paises?: string[];
  min_jugadores?: number;
  max_jugadores?: number;
  created_at?: string;
  created_by?: string;
};

export default function RoomCard({ room }: { room: Room }) {
  const { t } = useTranslation(['rooms', 'common']);
  const router = useRouter();

  const handleJoinRoom = () => {
    router.push(`/room/${room.id}`);
  };

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-xl border border-violet-500 shadow-md hover:border-violet-400 transition-colors">
      <h3 className="text-lg font-bold text-violet-300 mb-2">{room.nombre}</h3>
      <div className="space-y-1 text-sm text-gray-400 mb-3">
        <p>🎮 <span className="text-white">{room.juego}</span></p>
        <p>🌍 {room.regiones?.join(', ')}</p>
        <p>🗣️ {room.idiomas?.join(', ')}</p>
        <p>💻 {room.sistemas?.join(', ')}</p>
        {room.paises && room.paises.length > 0 && (
          <p>🏳️ {room.paises.join(', ')}</p>
        )}
        {room.min_jugadores && room.max_jugadores && (
          <p>👥 {t('rooms.card.playersCount', { min: room.min_jugadores, max: room.max_jugadores })}</p>
        )}
      </div>
      <button
        onClick={handleJoinRoom}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
      >
        🚪 {t('rooms.card.enterRoom')}
      </button>
    </div>
  );
}