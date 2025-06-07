# Próximos Pasos - Google AdSense

## Estado Actual ✅
- ✅ Publisher ID configurado: `ca-pub-7274762890410296`
- ✅ Script de AdSense añadido al layout
- ✅ Componentes de anuncios implementados
- ✅ Sistema de fallback funcionando
- ✅ Integración completa realizada

## Esperando Verificación ⏳
- ⏳ Google AdSense está revisando tu sitio web
- ⏳ Los Slot IDs están como "PENDING_VERIFICATION"

## Una vez que Google AdSense apruebe tu sitio:

### 1. Crear Unidades de Anuncio en AdSense
Entra a tu cuenta de AdSense y crea 4 unidades de anuncio:

**a) Anuncio Sidebar (300x600 o adaptable)**
- Nombre: GameGoUp - Sidebar
- Tipo: Display adaptable
- Ubicación sugerida: Sidebar de la aplicación

**b) Anuncio Banner (728x90 o adaptable)**
- Nombre: GameGoUp - Banner Dashboard
- Tipo: Display adaptable
- Ubicación sugerida: Después de estadísticas en dashboard

**c) Anuncio Card Principal (300x250)**
- Nombre: GameGoUp - Card Principal
- Tipo: Display adaptable
- Ubicación sugerida: Community Hub

**d) Anuncio Card Secundario (300x250)**
- Nombre: GameGoUp - Card Secundario
- Tipo: Display adaptable
- Ubicación sugerida: Community Hub

### 2. Obtener los Slot IDs
Cada unidad de anuncio generará un Slot ID único, por ejemplo:
- `1234567890`
- `0987654321`
- etc.

### 3. Actualizar la Configuración
Edita el archivo `lib/adConfig.ts` y reemplaza:

```typescript
slots: {
  sidebar: 'TU_SLOT_ID_SIDEBAR',
  banner: 'TU_SLOT_ID_BANNER', 
  cardMain: 'TU_SLOT_ID_CARD_1',
  cardSecondary: 'TU_SLOT_ID_CARD_2',
  footer: 'TU_SLOT_ID_FOOTER'  // Si decides agregar uno en el footer
},
```

### 4. Verificar Funcionamiento
Una vez actualizados los Slot IDs:

1. **Desarrollo**: Los anuncios de AdSense NO se mostrarán en localhost
2. **Producción**: Despliega a tu dominio real y verifica que los anuncios aparezcan
3. **Testing**: Usa las herramientas de AdSense para verificar implementación

### 5. Optimización Post-Implementación

**Monitoreo:**
- Revisa métricas en AdSense dashboard
- Analiza CTR (Click-Through Rate)
- Monitorea earnings diarios

**Ajustes:**
- Si algún anuncio no funciona bien, ajusta tamaños
- Experimenta con posiciones para mejor rendimiento
- Considera Auto Ads de AdSense para optimización automática

### 6. Archivo a Actualizar

Solo necesitas modificar **UN ARCHIVO**:
```
lib/adConfig.ts
```

Cambia las líneas con "PENDING_VERIFICATION" por los Slot IDs reales.

### 7. Comandos Útiles

```bash
# Verificar implementación local (anuncios fallback)
npm run dev

# Build para producción
npm run build

# Testing de integración
node test-integration.js
```

## Troubleshooting Común

### Los anuncios no aparecen:
1. Verifica que el dominio esté aprobado en AdSense
2. Confirma que los Slot IDs sean correctos
3. Asegúrate de estar en producción (no localhost)
4. Revisa la consola del navegador por errores

### Anuncios en blanco:
1. Puede tomar hasta 24-48 horas para que AdSense empiece a servir anuncios
2. Verifica que el contenido cumpla con las políticas de AdSense
3. Confirma que no hay AdBlock activo

### Bajos earnings:
1. Optimiza posición de anuncios
2. Considera tamaños de anuncio más efectivos
3. Aumenta tráfico del sitio
4. Experimenta con diferentes tipos de anuncio

## Notas Importantes

- **NO** hagas clic en tus propios anuncios (viola TOS de AdSense)
- Mantén un equilibrio entre anuncios y experiencia de usuario
- Los anuncios fallback seguirán funcionando si AdSense falla
- El sistema es completamente no invasivo al diseño existente

---

**Estado**: ✅ Implementación completa, esperando aprobación de AdSense
**Próximo paso**: Crear unidades de anuncio una vez aprobado
