# Arquitectura de Red - DreamsApp

## 🌐 Diagrama de Conexiones

```
┌─────────────────────────────────────────────────────────────┐
│                    ACCESO DESDE INTERNET                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
              ┌─────────────────────────┐
              │  Navegador / Cliente    │
              │  https://pedidos.       │
              │  cafeteriadreams.com    │
              └────────────┬────────────┘
                           │
                           │ HTTPS (443)
                           ▼
              ┌─────────────────────────┐
              │   Internet Gateway      │
              │    (IP Pública)         │
              └────────────┬────────────┘
                           │
                           │ HTTPS
                           ▼
              ┌─────────────────────────┐
              │   Router con Túnel      │
              │  (Terminación SSL)      │
              │  - Recibe HTTPS         │
              │  - Convierte a HTTP     │
              │  - Port Forward 3000    │
              └────────────┬────────────┘
                           │
                           │ HTTP (puerto 3000)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       RED LOCAL (WiFi)                       │
│                                                              │
│  ┌──────────────────┐           ┌─────────────────────┐    │
│  │   App Móvil      │           │   Servidor Node.js  │    │
│  │   (Ionic/Cap.)   │───HTTP───▶│   Puerto 3000       │    │
│  │  192.168.x.x     │ (directo) │   192.168.88.251    │    │
│  └──────────────────┘           │                     │    │
│                                  │   Backend API       │    │
│  ┌──────────────────┐           │   - Express         │    │
│  │  Impresora       │◀──HTTP────│   - MySQL           │    │
│  │  Plugin:8000     │           │   - HTTP Only       │    │
│  └──────────────────┘           └─────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Flujo de Seguridad

### 1. Acceso desde Internet (Navegadores Web)

```
Cliente → HTTPS (encriptado) → Router/Túnel → HTTP (local seguro) → Backend
        ✅ Seguro             ✅ Termina SSL    ✅ Red interna      ✅ Puerto 3000
```

**Características:**
- Conexión encriptada desde Internet hasta el router
- El router/túnel hace **terminación SSL** (descifra HTTPS)
- Dentro de la red local, usa HTTP (seguro porque es red privada)
- El backend solo ve tráfico HTTP

### 2. Acceso desde Red Local (App Móvil)

```
App Móvil → HTTP (directo) → Backend
          ✅ Red local       ✅ Puerto 3000
```

**Características:**
- Conexión directa HTTP dentro de la red local
- No pasa por el túnel
- Más rápido (sin overhead de SSL)
- Seguro porque es red privada

## ⚙️ Configuración del Router/Túnel

El router/túnel debe estar configurado para:

### Port Forwarding:
```
Puerto externo: 443 (HTTPS)  →  Puerto interno: 3000 (HTTP)
```

### Terminación SSL:
- El router/túnel tiene el certificado SSL instalado
- Acepta conexiones HTTPS desde Internet
- Convierte a HTTP para la red local
- Reenvía al servidor en puerto 3000

### Ejemplos de Túneles Comunes:

#### Cloudflare Tunnel:
```bash
# Configuración cloudflared
cloudflared tunnel --url http://localhost:3000
```
- Cloudflare maneja SSL automáticamente
- No necesitas certificados en tu servidor

#### Nginx Reverse Proxy:
```nginx
server {
    listen 443 ssl;
    server_name pedidos.cafeteriadreams.com;
    
    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;
    
    location / {
        proxy_pass http://192.168.88.251:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Router con VPN/Túnel integrado:
- Configurar en la interface web del router
- Activar "SSL Offloading" o "SSL Termination"
- Port Forward: 443 (externo) → 3000 (interno)

## 🔒 Seguridad

### ✅ Ventajas de esta Arquitectura:

1. **SSL Centralizado**
   - Certificados gestionados en un solo lugar (router/túnel)
   - Más fácil renovar certificados
   - No necesitas configurar SSL en Node.js

2. **Mejor Rendimiento**
   - Node.js no procesa SSL (menos CPU)
   - Conexiones locales sin overhead de SSL
   - App móvil más rápida en red local

3. **Simplicidad**
   - Backend solo maneja HTTP
   - Código más simple
   - Menos dependencias

### ⚠️ Consideraciones de Seguridad:

1. **Red Local Debe Ser Segura**
   - WiFi con contraseña fuerte (WPA3/WPA2)
   - Firewall activo en el router
   - Solo usuarios confiables en la red

2. **Puerto 3000 Solo Accesible Localmente**
   - El router debe hacer port forwarding desde 443 → 3000
   - Acceso directo a puerto 3000 desde Internet bloqueado

3. **Certificados del Túnel**
   - Mantener certificados SSL actualizados en el router/túnel
   - Usar Let's Encrypt para renovación automática

## 📊 Tabla de Puertos

| Puerto | Protocolo | Uso | Expuesto a Internet | Acceso Local |
|--------|-----------|-----|---------------------|--------------|
| 3000 | HTTP | Backend API | ✅ Vía túnel (como HTTPS) | ✅ Directo |
| 8000 | HTTP | Plugin Impresora | ❌ No | ✅ Sí |
| 443 | HTTPS | Entrada Túnel | ✅ Sí (en router) | N/A |

## 🧪 Verificación de Configuración

### Desde Internet:
```bash
# Debe funcionar con HTTPS (el túnel lo maneja)
curl https://pedidos.cafeteriadreams.com/api/health

# Debe mostrar: {"status":"ok","database":"connected",...}
```

### Desde Red Local:
```bash
# Conexión directa HTTP
curl http://192.168.88.251:3000/api/health

# Debe mostrar: {"status":"ok","database":"connected",...}
```

### Verificar Headers:
```bash
# Desde Internet
curl -I https://pedidos.cafeteriadreams.com/api/health
# Debe mostrar: "HTTP/2 200" o "HTTP/1.1 200" con SSL

# Desde Local
curl -I http://192.168.88.251:3000/api/health
# Debe mostrar: "HTTP/1.1 200" sin SSL
```

## 💡 Beneficios de No Usar SSL en Node.js

1. **No necesitas gestionar certificados** en el servidor Node.js
2. **Renovación automática** en el router/túnel
3. **Mejor rendimiento** del backend
4. **Conexiones locales más rápidas** (sin overhead SSL)
5. **Código más simple** en Node.js
6. **Menos dependencias** y librerías

## 🔄 Si Cambias de Túnel/Router

Si en el futuro cambias la configuración del túnel:

1. **Mantén la terminación SSL en el punto de entrada**
2. **El backend sigue usando HTTP puerto 3000**
3. **Solo actualiza la configuración del router/túnel**
4. **No necesitas cambiar el código del backend**

## ✅ Resumen

Tu configuración actual es **óptima** para este escenario:

- ✅ HTTPS desde Internet (manejado por el túnel)
- ✅ HTTP en el backend (simple y eficiente)
- ✅ App móvil con acceso directo en red local
- ✅ No necesitas certificados en Node.js
- ✅ Todo funciona correctamente

**No necesitas cambiar nada - está bien diseñado!** 🎉
