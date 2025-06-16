export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Términos de Servicio</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-6">
            Bienvenido a GameGoUp. Al usar nuestra plataforma, aceptas estos términos de servicio. 
            Te recomendamos leerlos cuidadosamente.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Descripción del Servicio</h2>
          <p className="mb-4">
            GameGoUp es una plataforma social para gamers que permite crear y unirse a salas de chat, 
            conectar con otros jugadores y formar comunidades alrededor de videojuegos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Registro y Cuentas</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Debes proporcionar información precisa y actualizada</li>
            <li>Eres responsable de mantener la seguridad de tu cuenta</li>
            <li>No puedes crear múltiples cuentas para evadir restricciones</li>
            <li>Debes tener al menos 13 años para usar el servicio</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Conducta del Usuario</h2>
          <p className="mb-4">Al usar GameGoUp, te comprometes a:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Respetar a otros usuarios y mantener un ambiente positivo</li>
            <li>No publicar contenido ofensivo, discriminatorio o inapropiado</li>
            <li>No hacer spam, publicidad no autorizada o actividades maliciosas</li>
            <li>No intentar hackear o comprometer la seguridad de la plataforma</li>
            <li>Cumplir con todas las leyes aplicables</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Moderación</h2>
          <p className="mb-4">
            Nos reservamos el derecho de moderar contenido y expulsar usuarios que violen 
            estos términos. Los creadores de salas pueden moderar sus propias salas.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Propiedad Intelectual</h2>
          <p className="mb-4">
            GameGoUp y su contenido están protegidos por derechos de autor y otras leyes 
            de propiedad intelectual. Los usuarios conservan los derechos sobre el contenido 
            que publican, pero nos otorgan licencia para mostrarlo en la plataforma.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Publicidad</h2>
          <p className="mb-4">
            Nuestra plataforma puede mostrar anuncios proporcionados por terceros, 
            incluyendo Google AdSense. Los anunciantes son responsables del contenido 
            de sus anuncios.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Limitación de Responsabilidad</h2>
          <p className="mb-4">
            GameGoUp se proporciona "tal como está" sin garantías. No somos responsables 
            por daños directos, indirectos o consecuentes derivados del uso del servicio.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Terminación</h2>
          <p className="mb-4">
            Puedes terminar tu cuenta en cualquier momento. Nos reservamos el derecho 
            de suspender o terminar cuentas que violen estos términos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Cambios a los Términos</h2>
          <p className="mb-4">
            Podemos actualizar estos términos ocasionalmente. Te notificaremos de cambios 
            significativos y el uso continuado constituye aceptación de los nuevos términos.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contacto</h2>
          <p className="mb-4">
            Si tienes preguntas sobre estos términos, puedes contactarnos a través de 
            nuestro sistema de soporte en la plataforma.
          </p>

          <p className="text-sm text-gray-400 mt-8">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  )
}
