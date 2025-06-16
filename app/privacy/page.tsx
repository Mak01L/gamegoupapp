export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-6">
            En GameGoUp, nos comprometemos a proteger tu privacidad y datos personales. 
            Esta política explica cómo recopilamos, usamos y protegemos tu información.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Información que Recopilamos</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Información de cuenta (email, nombre de usuario)</li>
            <li>Datos de perfil de gaming (juegos favoritos, región)</li>
            <li>Mensajes de chat en salas públicas</li>
            <li>Datos de uso y análisis anónimos</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Cómo Usamos tu Información</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Facilitar la comunicación entre jugadores</li>
            <li>Personalizar tu experiencia de gaming</li>
            <li>Mantener la seguridad de la plataforma</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies y Tecnologías Similares</h2>
          <p className="mb-4">
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia, 
            incluyendo cookies de análisis y publicidad de terceros como Google AdSense.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Publicidad</h2>
          <p className="mb-4">
            Trabajamos con Google AdSense para mostrar anuncios relevantes. 
            Google puede usar cookies para personalizar los anuncios que ves. 
            Puedes optar por no recibir anuncios personalizados visitando 
            <a href="https://www.google.com/settings/ads" className="text-violet-400 hover:text-violet-300"> 
              la configuración de anuncios de Google
            </a>.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Protección de Datos</h2>
          <p className="mb-4">
            Implementamos medidas de seguridad técnicas y organizativas para proteger 
            tus datos personales contra acceso no autorizado, alteración o destrucción.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Tus Derechos</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Acceder a tus datos personales</li>
            <li>Rectificar información incorrecta</li>
            <li>Eliminar tu cuenta y datos</li>
            <li>Portabilidad de datos</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contacto</h2>
          <p className="mb-4">
            Si tienes preguntas sobre esta política de privacidad, puedes contactarnos 
            a través de nuestro sistema de soporte en la plataforma.
          </p>

          <p className="text-sm text-gray-400 mt-8">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  )
}
