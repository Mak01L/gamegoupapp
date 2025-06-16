export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Contacto</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">¿Cómo podemos ayudarte?</h2>
            
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  💬 Soporte General
                </h3>
                <p className="text-gray-300 mb-3">
                  Para dudas sobre el funcionamiento de la plataforma, problemas técnicos 
                  o sugerencias de mejora.
                </p>
                <p className="text-sm text-gray-400">
                  Respuesta típica: 24-48 horas
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  🛡️ Reportar Problemas
                </h3>
                <p className="text-gray-300 mb-3">
                  Para reportar comportamiento inapropiado, problemas de moderación 
                  o contenido que viola nuestros términos.
                </p>
                <p className="text-sm text-gray-400">
                  Respuesta prioritaria: 12-24 horas
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  🎮 Partnerships Gaming
                </h3>
                <p className="text-gray-300 mb-3">
                  Para colaboraciones, eventos gaming, patrocinios o partnerships 
                  con comunidades y organizaciones esports.
                </p>
                <p className="text-sm text-gray-400">
                  Respuesta: 3-5 días hábiles
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Envíanos un mensaje</h2>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Asunto
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="support">Soporte Técnico</option>
                    <option value="report">Reportar Problema</option>
                    <option value="suggestion">Sugerencia</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
                    placeholder="Describe tu consulta o problema con el mayor detalle posible..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Enviar Mensaje
                </button>
              </form>

              <div className="mt-6 text-sm text-gray-400">
                <p>
                  Al enviar este formulario, aceptas nuestros{' '}
                  <a href="/terms" className="text-violet-400 hover:text-violet-300">
                    Términos de Servicio
                  </a>{' '}
                  y{' '}
                  <a href="/privacy" className="text-violet-400 hover:text-violet-300">
                    Política de Privacidad
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Preguntas Frecuentes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold mb-3">¿Cómo creo una sala de chat?</h3>
              <p className="text-gray-300 text-sm">
                Ve a "Crear Sala" en el menú principal, elige tu juego favorito, 
                configura los parámetros y ¡listo! Tu sala estará disponible para otros jugadores.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold mb-3">¿Es gratis usar GameGoUp?</h3>
              <p className="text-gray-300 text-sm">
                Sí, GameGoUp es completamente gratuito. Puedes crear salas, chatear 
                y conectar con otros gamers sin costo alguno.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold mb-3">¿Cómo reporto comportamiento inapropiado?</h3>
              <p className="text-gray-300 text-sm">
                Puedes reportar usuarios usando el botón de reporte en su perfil 
                o contactándonos directamente a través de este formulario.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold mb-3">¿Admiten mi juego favorito?</h3>
              <p className="text-gray-300 text-sm">
                Soportamos una amplia variedad de juegos populares. Si no encuentras 
                el tuyo, contáctanos y lo consideraremos para futuras actualizaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
