# Configuración para Apps Móviles en Red Local

## 📱 Resumen

La aplicación móvil de DreamsApp **trabaja exclusivamente en red local** (misma red WiFi que el servidor).

**Arquitectura:**
- Backend HTTP puerto 3000
- Acceso desde Internet: El túnel del router convierte HTTPS → HTTP
- Acceso desde red local: Conexión directa HTTP
- No se necesitan certificados SSL en Node.js (el túnel los maneja)

## 🔧 Configuración del Backend

### Variables de Entorno

En el archivo `my-api/.env`:

```env
# Servidor HTTP (Compatible con APK y túnel)
PORT=3000
USE_HTTPS=false          # El túnel maneja HTTPS, backend usa HTTP

# CORS - Permitir ambos protocolos
CORS_ORIGINS=http://pedidos.cafeteriadreams.com,https://pedidos.cafeteriadreams.com
```

### Funcionamiento

**Backend único en puerto 3000 con HTTP:**
- ✅ Desde Internet: `https://pedidos.cafeteriadreams.com` → Túnel convierte a HTTP → Backend:3000
- ✅ Desde red local: `http://192.168.88.251:3000` → Directo → Backend:3000
- ✅ App móvil APK: `http://pedidos.cafeteriadreams.com:3000/api` → Funciona igual en ambos casos

## 📲 Configuración de la App Móvil

### 1. Obtener la IP del Servidor

Al iniciar el backend, verás algo como:

```
===========================================
  📱 API Server HTTP (Apps Móviles Locales)
===========================================
Puerto: 3001
Disponible en:
  - Red Local: http://192.168.88.251:3001/api
===========================================
```

### 2. Configurar la URL en la App

Tu APK ya está correctamente configurada:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://pedidos.cafeteriadreams.com:3000/api',      ✅ Correcto
  apiBaseUrl: 'http://pedidos.cafeteriadreams.com:3000',       ✅ Correcto
  printerPluginUrl: 'http://pedidos.cafeteriadreams.com:8000'  ✅ Correcto (o IP local)
};
```

**Esta configuración funciona para:**
- ✅ Acceso desde red local (WiFi del servidor)
- ✅ Acceso desde Internet vía túnel (el router convierte HTTPS a HTTP internamente)

**⚠️ IMPORTANTE:** 
- La URL usa `http://` pero desde Internet llega como HTTPS (el túnel lo maneja)
- Dentro de la red local es HTTP directo

### 3. Verificar Conexión

Prueba desde tu dispositivo móvil:

```javascript
// En tu servicio de API
this.http.get('http://192.168.88.251:3001/api/health')
  .subscribe(
    response => console.log('✅ Conectado:', response),
    error => console.error('❌ Error:', error)
  );
```

## 🌐 Casos de Uso

### ✅ Uso Normal: Desarrollo Local con WiFi

```
[Servidor] ←→ WiFi Local ←→ [App Móvil]
http://192.168.88.251:3001/api
```

- El móvil y el servidor están en la **misma red WiFi**
- Usa HTTP puerto 3001
- No requiere certificados SSL
- **Este es el único modo de uso para la app móvil**

### ❌ NO Soportado: Acceso desde Internet

La app móvil **NO puede** acceder al servidor desde Internet (fuera de la red local). Solo funciona cuando ambos dispositivos están en la misma WiFi.

## 🔒 Seguridad

### Arquitectura de Seguridad:

```
Internet (HTTPS) → Túnel/Router → HTTP Local → Backend:3000
Red Local (HTTP) → Backend:3000
```

**El túnel del router hace "terminación SSL":**
- Recibe HTTPS desde Internet
- Convierte a HTTP para la red local
- Reenvía al backend en puerto 3000

### Ventajas:
✅ No necesitas certificados SSL en Node.js
✅ El túnel maneja renovación de certificados
✅ Mejor rendimiento (Node.js no procesa SSL)
✅ Conexiones locales más rápidas

### Configuración de Red:

1. **Puerto 3000 en el router:**
   - Abierto y redirigido desde puerto 443 (HTTPS externo)
   - El túnel hace la conversión HTTPS → HTTP
   - Backend recibe solo HTTP

2. **Firewall Windows:**
   - Permitir puerto 3000 en red privada:
   ```powershell
   New-NetFirewallRule -DisplayName "DreamsApp Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Private
   ```

## 🧪 Pruebas

### Desde el Servidor (Windows)

```powershell
# Probar HTTPS
curl https://localhost:3000/api/health -k

# Probar HTTP
curl http://localhost:3001/api/health
```

### Desde el Móvil (navegador)

1. Conectar el móvil a la misma WiFi que el servidor
2. Abrir navegador en el móvil
3. Visitar: `http://192.168.88.251:3001/api/health`
4. Deberías ver: `{"status":"ok","database":"connected",...}`

### Desde la App Ionic/Capacitor

```typescript
// En tu servicio
constructor(private http: HttpClient) {}

testConnection() {
  const localUrl = 'http://192.168.88.251:3001/api/health';
  
  this.http.get(localUrl).subscribe({
    next: (response) => {
      console.log('✅ Conexión exitosa:', response);
      alert('Conectado al servidor local');
    },
    error: (error) => {
      console.error('❌ Error de conexión:', error);
      alert('No se pudo conectar. ¿Estás en la misma red WiFi?');
    }
  });
}
```

## 🛠️ Solución de Problemas

### Error: "Failed to fetch" o "Network Error"

**Causa:** El móvil no puede alcanzar el servidor

**Solución:**
1. Verificar que ambos dispositivos estén en la misma red WiFi
2. Verificar la IP del servidor (puede cambiar)
3. Desactivar firewall temporalmente para probar
4. Verificar que el puerto 3001 no esté bloqueado

### Error: "CORS policy"

**Causa:** El origen no está permitido

**Solución:**
1. Verificar que `ENABLE_HTTP_MOBILE=true` en `.env`
2. Reiniciar el servidor backend
3. Verificar en los logs del servidor que aparezca:
   ```
   [CORS] Permitiendo acceso desde red local: http://192.168.x.x:xxxx
   ```

### La IP del servidor cambió

**Solución:**
1. **Opción A:** Configurar IP estática en el router para el servidor
   - Acceder a la configuración del router
   - Asignar IP fija (ej: 192.168.88.251) a la MAC del servidor
   - La IP no cambiará aunque se reinicie el servidor

2. **Opción B:** Actualizar la IP en la app cuando cambie
   - Verificar la IP actual al iniciar el backend
   - Actualizar `environment.ts` en la app
   - Recompilar la app

### ❌ No puedo conectar desde fuera de la WiFi

Si tu APK está configurada con `http://pedidos.cafeteriadreams.com:3000/api`:
- ✅ **SÍ debería funcionar desde Internet** (vía túnel HTTPS)
- ✅ **SÍ debería funcionar desde red local** (HTTP directo)

Si no funciona desde fuera, verifica:
1. Puerto 3000 abierto en el router (o puerto 443 con forward a 3000)
2. Túnel configurado correctamente
3. Dominio apuntando a tu IP pública

## 📊 Resumen de Puertos

| Puerto | Protocolo | Uso | Expuesto | App Móvil |
|--------|-----------|-----|----------|-----------|
| 3000 | HTTP | Backend API | ✅ Vía túnel | ✅ **Sí** |
| 8000 | HTTP | Plugin Impresora | ❌ No | ✅ Local |
| 443 | HTTPS | Entrada Túnel (router) | ✅ Sí | N/A |

**La app móvil usa puerto 3000 con HTTP, funciona en red local y desde Internet (vía túnel)**

## 🔄 Configuración Recomendada

### Para Sistema Completo
```env
PORT=3000                    # Puerto HTTP único
USE_HTTPS=false              # El túnel maneja HTTPS
NODE_ENV=production
```

### Configuración de Router
```
Puerto externo: 443 (HTTPS) → Túnel → Puerto interno: 3000 (HTTP)
```

## ✅ Checklist para App Móvil

- [ ] Backend corriendo en puerto 3000 con HTTP
- [ ] `USE_HTTPS=false` en `.env`
- [ ] Túnel del router configurado (HTTPS → HTTP)
- [ ] Puerto 3000 accesible en red local
- [ ] APK configurada con `http://pedidos.cafeteriadreams.com:3000/api`
- [ ] Probada conexión desde red local
- [ ] Probada conexión desde Internet (vía túnel)

## 💡 Resumen Rápido

**Tu configuración actual:**

1. Backend HTTP en puerto 3000 ✅
2. APK apunta a `http://pedidos.cafeteriadreams.com:3000` ✅
3. Túnel convierte HTTPS a HTTP ✅
4. Funciona en red local Y desde Internet ✅

**Todo está correctamente configurado!** 

- ✅ Funciona desde red local (HTTP directo)
- ✅ Funciona desde Internet (túnel HTTPS → HTTP)
- ✅ No necesitas certificados en Node.js
- ✅ APK no necesita cambios

---

**¡Tu arquitectura con túnel es óptima!** 📱🔒✅

Para más detalles sobre la arquitectura, consulta: **[ARQUITECTURA_RED.md](ARQUITECTURA_RED.md)**
