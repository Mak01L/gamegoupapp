'use client'

import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation(['common'])

  return (
    <footer className="bg-black border-t border-[#292929] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">🎮 GameGoUp</h3>
            <p className="text-gray-400 text-sm">
              La plataforma definitiva para conectar gamers de todo el mundo.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/rooms" className="hover:text-white transition-colors">Explorar Salas</a></li>
              <li><a href="/rooms/create" className="hover:text-white transition-colors">Crear Sala</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Perfil</a></li>
            </ul>
          </div>

          {/* Gaming */}
          <div>
            <h4 className="font-semibold mb-4">Gaming</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/rooms?game=Valorant" className="hover:text-white transition-colors">Valorant</a></li>
              <li><a href="/rooms?game=League of Legends" className="hover:text-white transition-colors">League of Legends</a></li>
              <li><a href="/rooms?game=Counter-Strike 2" className="hover:text-white transition-colors">Counter-Strike 2</a></li>
              <li><a href="/rooms?game=Fortnite" className="hover:text-white transition-colors">Fortnite</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Términos de Servicio</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#292929] mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} GameGoUp. Todos los derechos reservados.</p>
          <p className="mt-2">
            Plataforma gaming social para conectar jugadores de todo el mundo.
          </p>
        </div>
      </div>
    </footer>
  )
}
