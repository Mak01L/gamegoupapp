# 🌐 Guía de Configuración de Dominio Personalizado

## Configuración en Vercel

1. **Accede a tu proyecto**: `gamegoupapp-r1nx` en Vercel
2. **Ve a**: Settings → Domains
3. **Agrega tu dominio**: 
   - Escribe: `tudominio.com` (reemplaza con tu dominio real)
   - Click "Add"
4. **Vercel mostrará**: Los registros DNS que necesitas

## Configuración en Hostinger

### Paso 1: Acceder al Panel DNS
1. Inicia sesión en Hostinger
2. Ve a: **Hosting** → **Gestionar**
3. Busca: **Zona DNS** o **DNS Zone**

### Paso 2: Configurar Registros DNS

#### Para el dominio principal (tudominio.com):
```
Tipo: A
Nombre: @ (o déjalo vacío)
Apunta a: 76.76.19.61
TTL: 3600 (o Auto)
```

#### Para www (www.tudominio.com):
```
Tipo: CNAME
Nombre: www
Apunta a: cname.vercel-dns.com
TTL: 3600 (o Auto)
```

### Paso 3: Eliminar registros conflictivos
- **Elimina** cualquier registro A o CNAME existente que apunte a @ o www
- **Mantén** solo los registros MX (email) si los tienes

## Verificación

### En Vercel:
1. Espera 5-10 minutos después de configurar DNS
2. Ve a Settings → Domains
3. Verifica que aparezca ✅ junto a tu dominio

### Prueba de acceso:
- `http://tudominio.com` → debe redirigir a tu app
- `https://tudominio.com` → debe funcionar con SSL automático
- `https://www.tudominio.com` → debe funcionar

## Tiempos de Propagación
- **Hostinger**: 5-15 minutos
- **Propagación global**: 24-48 horas máximo
- **SSL automático**: 5-10 minutos después de verificación

## Troubleshooting

### Si no funciona después de 1 hora:
1. Verifica los registros DNS con: https://dnschecker.org
2. Revisa que no haya registros conflictivos
3. Contacta soporte de Hostinger si persiste

### Errores comunes:
- **"Domain not found"**: DNS no propagado aún
- **"SSL error"**: Espera 10 minutos más
- **"Redirect loop"**: Revisa configuración de subdominios

## URLs finales esperadas:
- ✅ `https://tudominio.com` → Tu aplicación GameGoUp
- ✅ `https://www.tudominio.com` → Tu aplicación GameGoUp
- ✅ `https://gamegoupapp-r1nx.vercel.app` → Sigue funcionando como backup
