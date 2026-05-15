# Solución de Problemas iOS con Túnel HTTPS

## 🍎 Problemas Comunes en iPhone/iPad

Los dispositivos iOS (iPhone/iPad) son más estrictos con las políticas de seguridad web. Esta guía resuelve los problemas más comunes cuando se accede a través de un túnel HTTPS.

## ✅ Configuración Aplicada

### 1. Trust Proxy Habilitado
```javascript
app.set('trust proxy', true);
```
**Qué hace:** Permite que Express reconozca correctamente las peticiones que vienen del túnel HTTPS.

### 2. CORS Mejorado para iOS
- **MaxAge: 24 horas** - Reduce peticiones OPTIONS en iOS
- **Credentials: true** - Permite cookies y autenticación
- **OptionsSuccessStatus: 204** - iOS prefiere código 204 para OPTIONS
- **Headers adicionales** - Incluye X-Forwarded-* para túneles

### 3. Headers de Seguridad
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

### 4. Cache Control Optimizado
- **Archivos estáticos:** Cache agresivo (1 año)
- **index.html:** Sin cache (iOS necesita versión fresca)
- **API responses:** Sin cache por defecto

### 5. Límites de Payload Aumentados
```javascript
bodyParser.json({ limit: '10mb' })
```
**Por qué:** iOS puede enviar más datos en peticiones POST (fotos, etc.)

## 🔍 Diagnóstico de Problemas

### Problema 1: "Cannot connect to server"

**Síntomas:**
- Funciona en Android pero no en iPhone
- Funciona en WiFi pero no con 4G/5G
- Error de red genérico

**Soluciones:**

1. **Verificar que el túnel esté funcionando:**
   ```bash
   curl -I https://pedidos.cafeteriadreams.com/api/health
   ```
   Debe devolver HTTP 200

2. **Verificar headers del túnel:**
   - El túnel debe enviar `X-Forwarded-Proto: https`
   - El túnel debe enviar `X-Forwarded-For: [IP-cliente]`

3. **Comprobar en Safari (iPhone):**
   - Abrir: `https://pedidos.cafeteriadreams.com`
   - Abrir consola de desarrollo (si está conectado a Mac)
   - Buscar errores CORS o Mixed Content

### Problema 2: "Mixed Content" (contenido mixto)

**Síntomas:**
- Algunos recursos no cargan
- Console error: "Mixed Content"
- Imágenes o scripts no se muestran

**Causa:** La página se carga por HTTPS pero intenta cargar recursos por HTTP.

**Solución:**

1. **Verificar Angular environment:**
   ```typescript
   // src/environments/environment.prod.ts
   export const environment = {
     production: true,
     apiUrl: '/api',  // ✅ Usar ruta relativa
     // O si es absoluta:
     apiUrl: 'https://pedidos.cafeteriadreams.com/api',  // ✅ HTTPS
     // NO usar:
     // apiUrl: 'http://pedidos.cafeteriadreams.com:3000/api'  // ❌ HTTP
   };
   ```

2. **Usar rutas relativas:**
   ```typescript
   // En lugar de URL completa
   this.http.get('/api/productos')
   // En lugar de
   this.http.get('http://...')
   ```

3. **En el HTML de Angular:**
   ```html
   <!-- ✅ Correcto -->
   <img src="/assets/logo.png">
   <img src="https://pedidos.cafeteriadreams.com/assets/logo.png">
   
   <!-- ❌ Incorrecto -->
   <img src="http://pedidos.cafeteriadreams.com/assets/logo.png">
   ```

### Problema 3: CORS Errors en iPhone

**Síntomas:**
- Console: "Access to fetch blocked by CORS policy"
- Funciona en otros navegadores pero no en Safari iOS

**Solución:**

1. **Verificar CORS_ORIGINS en .env:**
   ```env
   CORS_ORIGINS=https://pedidos.cafeteriadreams.com,http://pedidos.cafeteriadreams.com
   ```

2. **Verificar que el backend responda a OPTIONS:**
   ```bash
   curl -X OPTIONS https://pedidos.cafeteriadreams.com/api/health -v
   ```
   Debe devolver 204 y headers CORS

3. **Logs del servidor:**
   Si ves `[CORS] Origen no permitido:` en los logs, agrega ese origen a `CORS_ORIGINS`

### Problema 4: Cookies/Sesión no funcionan

**Síntomas:**
- Login funciona pero la sesión no persiste
- Necesita re-login constantemente en iPhone

**Solución:**

1. **Cookies con SameSite:**
   ```javascript
   // En el backend al crear sesiones/cookies
   res.cookie('sessionId', value, {
     httpOnly: true,
     secure: true,  // ✅ IMPORTANTE para HTTPS
     sameSite: 'none',  // ✅ Permite cookies cross-site en iOS
     domain: 'pedidos.cafeteriadreams.com'
   });
   ```

2. **Verificar en Angular:**
   ```typescript
   // Asegurar que credentials está habilitado
   this.http.get('/api/user', { withCredentials: true })
   ```

### Problema 5: Redirecciones infinitas

**Síntomas:**
- La página se recarga constantemente
- Loop de redirecciones en iPhone

**Causa:** El servidor no detecta correctamente HTTPS del túnel

**Solución: Ya implementada** ✅
```javascript
// El servidor ahora verifica:
const protocol = req.headers['x-forwarded-proto'] || req.protocol;
```

### Problema 6: Timeout en peticiones

**Síntomas:**
- Peticiones se cortan después de unos segundos
- Funciona en redes rápidas, falla en 4G

**Solución: Ya implementada** ✅
```javascript
// Timeout aumentado a 30 segundos
proxyReq.setTimeout(30000);
```

## 🧪 Pruebas Específicas para iOS

### Test 1: Verificar HTTPS correcto
En Safari del iPhone, abrir:
```
https://pedidos.cafeteriadreams.com
```
✅ Debe mostrar el candado verde
✅ No debe haber advertencias de seguridad

### Test 2: Verificar API
En Safari del iPhone, abrir:
```
https://pedidos.cafeteriadreams.com/api/health
```
✅ Debe devolver JSON: `{"status":"ok",...}`

### Test 3: Verificar Mixed Content
1. Abrir la app en Safari iPhone
2. Conectar iPhone a Mac
3. Abrir Safari en Mac → Develop → [Tu iPhone] → [Página]
4. Console no debe mostrar errores de Mixed Content

### Test 4: Verificar Rendimiento
```bash
# Desde tu servidor, medir latencia
ping [IP-del-iPhone]

# Verificar headers del túnel
curl -I https://pedidos.cafeteriadreams.com
```

## 📱 Configuración Recomendada para PWA en iOS

Si tu app es PWA (Progressive Web App):

### manifest.json
```json
{
  "name": "Dreams App",
  "short_name": "Dreams",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3f51b5",
  "scope": "/",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

### Service Worker
Asegurar que use HTTPS:
```javascript
// service-worker.js
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('/service-worker.js');
}
```

## 🔧 Configuración del Túnel para iOS

### Cloudflare Tunnel
```yaml
tunnel: [tu-tunnel-id]
credentials-file: /path/to/credentials.json

ingress:
  - hostname: pedidos.cafeteriadreams.com
    service: http://localhost:3000
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s
      # Importante para iOS:
      httpHostHeader: pedidos.cafeteriadreams.com
```

### Nginx (si usas Nginx como túnel)
```nginx
server {
    listen 443 ssl http2;  # HTTP/2 es mejor para iOS
    server_name pedidos.cafeteriadreams.com;
    
    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;
    
    # Protocolos modernos para iOS
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Headers importantes para iOS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Headers cruciales para el backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts para iOS
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # WebSocket support (si es necesario)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## ✅ Checklist de Verificación para iOS

- [ ] Túnel HTTPS funcionando (candado verde en Safari)
- [ ] `trust proxy` habilitado en Express
- [ ] CORS configurado con ambos protocolos (http y https)
- [ ] Headers de seguridad configurados
- [ ] Rutas de Angular usan HTTPS o son relativas
- [ ] No hay Mixed Content (todo HTTPS o relativo)
- [ ] Cookies configuradas con `secure: true` y `sameSite: 'none'`
- [ ] Timeouts apropiados (30 segundos)
- [ ] Cache-Control configurado correctamente
- [ ] Probado en Safari iOS real (no solo simulador)
- [ ] Probado con 4G/5G (no solo WiFi)
- [ ] Console de Safari sin errores CORS
- [ ] API responde correctamente: `/api/health`

## 🆘 Si Aún No Funciona

1. **Capturar logs del servidor:**
   ```bash
   # Ver logs en tiempo real
   cd c:\Users\carlo\Desktop\DreamsApp\my-api
   npm start
   
   # Buscar:
   # - [CORS] Origen no permitido
   # - [PROXY ERROR]
   # - [TUNNEL] Request from
   ```

2. **Verificar desde el iPhone:**
   - Conectar iPhone a Mac con cable
   - Safari Mac → Develop → [iPhone] → [Tu sitio]
   - Console tab → Ver errores
   - Network tab → Ver peticiones fallidas

3. **Probar con curl desde el servidor:**
   ```bash
   # Simular petición del túnel
   curl -H "X-Forwarded-Proto: https" \
        -H "X-Forwarded-For: 1.2.3.4" \
        http://localhost:3000/api/health
   ```

4. **Revisar configuración del túnel:**
   - Verificar que envía headers X-Forwarded-*
   - Verificar timeout del túnel (debe ser > 30s)
   - Verificar que no modifica headers CORS

## 📞 Información de Debug

Si necesitas ayuda, recopila esta información:

```bash
# 1. Versión del backend
node --version

# 2. Logs del servidor (últimas 50 líneas con error)
# Copiar del terminal cuando se reproduce el error

# 3. Headers de prueba
curl -I https://pedidos.cafeteriadreams.com/api/health

# 4. Prueba de túnel
curl -v https://pedidos.cafeteriadreams.com

# 5. Modelo de iPhone y versión iOS
# (desde iPhone: Ajustes → General → Información)
```

---

**Los cambios ya están aplicados en tu servidor. Reinicia el backend para que tomen efecto.** ✅
