# Integración de AdSense y Donaciones - GameGoUp

## 🎯 Resumen
Este documento describe la implementación del sistema de donaciones y publicidad en GameGoUp, incluyendo la integración con PayPal y Google AdSense.

## 💰 Sistema de Donaciones

### URL de PayPal Integrada
- **URL de donación**: https://www.paypal.com/donate/?hosted_button_id=RH23HZUUGEGVN
- **Implementación**: `components/DonationWidget.tsx`
- **Funcionalidad**: Abre PayPal en nueva ventana al hacer clic

### Componentes de Donación
1. **DonationWidget** - 3 variantes:
   - `button`: Botón de acción rápida en dashboard
   - `card`: Tarjeta completa en sección de comunidad
   - `minimal`: Widget discreto en sidebar

### Ubicaciones
- ✅ Dashboard: Botón en quick actions
- ✅ Sidebar: Widget minimalista
- ✅ Community Hub: Tarjeta completa

## 📢 Sistema de Publicidad

### Google AdSense
- **Publisher ID**: Configurado en `lib/adConfig.ts`
- **Script**: Cargado en `app/layout.tsx`
- **Componentes**: `GoogleAdSense.tsx` y `AdManager.tsx`

### Configuración de Slots
En `lib/adConfig.ts` se configuran los siguientes slots:
```typescript
slots: {
  sidebar: 'YOUR_SIDEBAR_AD_SLOT_ID',
  banner: 'YOUR_BANNER_AD_SLOT_ID', 
  cardMain: 'YOUR_CARD_AD_SLOT_1_ID',
  cardSecondary: 'YOUR_CARD_AD_SLOT_2_ID'
}
```

### Componente AdManager
Sistema híbrido que:
- ✅ Usa Google AdSense cuando está disponible
- ✅ Detecta AdBlock automáticamente
- ✅ Muestra anuncios fallback cuando AdSense no funciona
- ✅ Soporte para 3 variantes: `sidebar`, `banner`, `card`

### Anuncios Fallback
Cuando AdSense no está disponible, se muestran anuncios propios:
- Gaming: Auriculares Gaming Pro
- Tech: Servidor VPS Gaming  
- Community: Discord de GameGoUp
- Pro: GameGoUp Pro features

## 🔧 Configuración Necesaria

### 1. Reemplazar IDs de AdSense
En `lib/adConfig.ts`, reemplazar:
```typescript
publisherId: 'ca-pub-YOUR_PUBLISHER_ID', // Tu Publisher ID real
slots: {
  sidebar: 'YOUR_SIDEBAR_AD_SLOT_ID',     // Tu Slot ID del sidebar
  banner: 'YOUR_BANNER_AD_SLOT_ID',       // Tu Slot ID del banner
  // etc...
}
```

### 2. Configurar Enlaces Reales
En `lib/adConfig.ts`, actualizar los enlaces de anuncios fallback:
```typescript
fallbackAds: {
  // Actualizar links reales aquí
}
```

## 📍 Ubicaciones de Anuncios

### Dashboard
- **Banner**: Después de estadísticas, antes de quick actions
- **Implementación**: `AdManager` con variant="banner"

### Sidebar  
- **Posición**: Entre estadísticas y widget de donación
- **Implementación**: `SidebarAd.tsx` usando `AdManager`

### Community Hub
- **Cards**: 2 anuncios en grid de comunidad
- **Implementación**: 2x `AdManager` con variant="card"

## 🎨 Estilos CSS

En `app/globals.css`:
```css
/* AdSense */
.adsbygoogle { display: block; }
.google-adsense-container { overflow: hidden; border-radius: 0.5rem; }

/* Animaciones */
.donation-heart { animation: heartbeat 2s ease-in-out infinite; }
```

## 🔍 Detección de AdBlock

El `AdManager` detecta automáticamente:
- ✅ Si AdBlock está activo
- ✅ Si Google AdSense está disponible
- ✅ Cambia a anuncios fallback automáticamente

## 📱 Diseño Responsivo

Todos los componentes son completamente responsivos:
- ✅ Mobile-first design
- ✅ Adaptación automática a diferentes tamaños
- ✅ Grid flexible en Community Hub

## 🚀 Próximos Pasos

1. **Obtener Publisher ID real** de Google AdSense
2. **Crear slots de anuncios** en AdSense console
3. **Actualizar configuración** en `lib/adConfig.ts`
4. **Probar en producción** la carga de anuncios
5. **Monitorear performance** y earnings

## 🔧 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 📊 Métricas y Análisis

- **Donaciones**: Trackear clicks en PayPal
- **Anuncios**: Usar Google AdSense reports
- **Fallback**: Monitorear cuándo se muestran anuncios propios

---

**✨ Integración completada**: Sistema de donaciones y publicidad no invasiva implementado exitosamente en GameGoUp!
