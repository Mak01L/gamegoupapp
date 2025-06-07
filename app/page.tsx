"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si hay usuario autenticado, redirigir al dashboard
        router.push('/dashboard');
      } else {
        // Si no hay usuario, redirigir al login
        router.push('/auth');
      }
    }
  }, [user, loading, router]);

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center mt-8 mb-4">
          <Image 
            src="/logo.png" 
            alt="GameGoUp Logo" 
            width={320} 
            height={320} 
            priority 
            className="w-80 h-80 animate-pulse"
            sizes="320px"
          />
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Iniciando GameGoUp...</p>
        </div>
      </main>
    );
  }

  // Esta página debería ser redirigida automáticamente, pero por si acaso:
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center justify-center mt-8 mb-4">
        <Image 
          src="/logo.png" 
          alt="GameGoUp Logo" 
          width={320} 
          height={320} 
          priority 
          className="w-80 h-80"
          sizes="320px"
        />
      </div>
      <p className="text-gray-300">Redirigiendo...</p>
    </main>
  );
}
