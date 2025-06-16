# 🎮 Chat Setup Instructions

## 🚨 Si encuentras el error "column 'is_active' does not exist":

### ⚡ SOLUCIÓN RÁPIDA - Ejecutar script de reparación:

1. **Abre Supabase Dashboard → SQL Editor**
2. **Ejecuta el archivo `supabase-chat-fix-error.sql`**
3. **Verifica con `verify-fix.sql`**
4. **¡Listo! El chat debería funcionar**

---

## 📋 Setup completo del chat (si empiezas desde cero):

### 1. Configurar base de datos

En **Supabase Dashboard → SQL Editor**, ejecuta:

```sql
-- Contenido del archivo: supabase-chat-setup.sql
```

### 2. Verificar instalación

Ejecuta para verificar:

```sql
-- Contenido del archivo: verify-chat-setup-complete.sql
```

### 3. ¿Funciona el chat?

- ✅ **SÍ**: El sistema de chat está listo
- ❌ **NO**: Usa el script de reparación arriba

---

## 🔧 Archivos disponibles:

- `supabase-chat-fix-error.sql` - **🚨 USAR PARA REPARAR ERROR**
- `verify-fix.sql` - Verificar que la reparación funcionó
- `supabase-chat-setup.sql` - Setup completo inicial
- `verify-chat-setup-complete.sql` - Verificación completa
- `quick-chat-setup-check.sql` - Verificación rápida

---

## 🚀 Funcionalidades del chat:

Una vez configurado, tendrás:

- ✅ **Mensajes en tiempo real**
- ✅ **Lista de usuarios activos**
- ✅ **Sistema de presencia**
- ✅ **Filtros de sala visibles**
- ✅ **Botón de salir de sala**
- ✅ **Seguridad RLS completa**
