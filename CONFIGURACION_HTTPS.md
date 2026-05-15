# Guía de Configuración HTTPS para DreamsApp

## 🔒 Visión General

La aplicación DreamsApp ahora trabaja exclusivamente con HTTPS para garantizar la seguridad de las comunicaciones entre cliente y servidor.

## 📋 Requisitos Previos

- Node.js instalado
- MySQL instalado y configurado
- Dominio configurado (pedidos.cafeteriadreams.com)
- Certificados SSL (Let's Encrypt recomendado)
- Puertos abiertos en el router:
  - Puerto 443 (HTTPS Frontend)
  - Puerto 80 (HTTP → redirección a HTTPS)
  - Puerto 3000 (HTTPS API Backend)

## 🔐 Paso 1: Obtener Certificados SSL

### Opción A: Let's Encrypt (Producción - Recomendado)

Los certificados de Let's Encrypt son gratuitos, confiables y renovables automáticamente.

#### En Windows:

1. **Descargar Certbot:**
   - Visitar: https://certbot.eff.org/
   - Descargar la versión para Windows

2. **Detener servicios que usen puerto 80:**
   ```powershell
   # Si tienes algún servidor corriendo en puerto 80, deténlo temporalmente
   ```

3. **Ejecutar Certbot en modo standalone:**
   ```powershell
   certbot certonly --standalone -d pedidos.cafeteriadreams.com
   ```

4. **Copiar certificados a la aplicación:**
   ```powershell
   # Los certificados se generan en: C:\Certbot\live\pedidos.cafeteriadreams.com\
   cd c:\Users\carlo\Desktop\DreamsApp\certs
   copy C:\Certbot\live\pedidos.cafeteriadreams.com\fullchain.pem server.crt
   copy C:\Certbot\live\pedidos.cafeteriadreams.com\privkey.pem server.key
   ```

5. **Configurar renovación automática:**
   - Los certificados duran 90 días
   - Crear una tarea programada en Windows para ejecutar cada 60 días:
   ```powershell
   certbot renew --quiet
   ```

### Opción B: Certificado Autofirmado (Solo Desarrollo)

⚠️ **Advertencia:** Los certificados autofirmados mostrarán advertencias de seguridad en los navegadores.

1. **Instalar OpenSSL:**
   - Descargar desde: https://slproweb.com/products/Win32OpenSSL.html
   - O usar Git Bash que incluye OpenSSL

2. **Generar certificado:**
   ```bash
   cd c:\Users\carlo\Desktop\DreamsApp\certs
   openssl genrsa -out server.key 2048
   openssl req -new -x509 -key server.key -out server.crt -days 365
   ```

3. **Completar información:**
   - Common Name (CN): **pedidos.cafeteriadreams.com**
   - Los demás campos son opcionales

## ⚙️ Paso 2: Configurar Variables de Entorno

1. **Navegar a la carpeta del backend:**
   ```bash
   cd c:\Users\carlo\Desktop\DreamsApp\my-api
   ```

2. **Copiar el archivo de ejemplo:**
   ```bash
   copy .env.example .env
   ```

3. **Editar el archivo `.env`:**
   ```env
   # Configuración del servidor
   PORT=3000
   HTTP_PORT=3001
   HTTPS_PORT=443
   HTTP_FRONTEND_PORT=80
   NODE_ENV=production
   
   # Habilitar HTTPS (true por defecto)
   USE_HTTPS=true
   
   # Dominio público
   DOMAIN=pedidos.cafeteriadreams.com
   API_URL=https://pedidos.cafeteriadreams.com:3000
   
   # Base de datos
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=TU_PASSWORD_AQUI
   DB_NAME=DreamsApp
   
   # Base de datos de tickets
   DB_TICKETS_HOST=localhost
   DB_TICKETS_USER=root
   DB_TICKETS_PASSWORD=TU_PASSWORD_AQUI
   DB_TICKETS_NAME=TicketsDB
   
   # Plugin de impresión
   PRINTER_PLUGIN_URL=http://192.168.88.251:8000
   
   # CORS - Solo dominios HTTPS
   CORS_ORIGINS=https://pedidos.cafeteriadreams.com,https://localhost
   ```

## 🚀 Paso 3: Instalar Dependencias

```bash
# Frontend
cd c:\Users\carlo\Desktop\DreamsApp
npm install

# Backend
cd my-api
npm install
```

## 🏃 Paso 4: Iniciar los Servidores

### Opción A: Iniciar todo de una vez (Recomendado)
```bash
cd c:\Users\carlo\Desktop\DreamsApp
start-all.bat
```

### Opción B: Iniciar manualmente

**Terminal 1 - Backend:**
```bash
cd c:\Users\carlo\Desktop\DreamsApp\my-api
npm start
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\carlo\Desktop\DreamsApp
npm run serve
```

## 🔍 Verificación

1. **Verificar Backend HTTPS:**
   ```
   https://localhost:3000/api/health
   ```
   Deberías ver: `{"status":"ok","database":"connected",...}`

2. **Verificar Frontend HTTPS:**
   ```
   https://localhost
   o
   https://pedidos.cafeteriadreams.com
   ```

3. **Verificar redirección HTTP → HTTPS:**
   ```
   http://localhost
   ```
   Debería redirigir automáticamente a `https://localhost`

## 🌐 Configuración del Router

Para que el dominio funcione desde Internet:

1. **Port Forwarding en el Router:**
   - Puerto 443 (externo) → 443 (interno) - Frontend HTTPS
   - Puerto 80 (externo) → 80 (interno) - Redirección HTTP
   - Puerto 3000 (externo) → 3000 (interno) - API HTTPS

2. **DNS:**
   - Configurar el dominio `pedidos.cafeteriadreams.com` para que apunte a tu IP pública

## 🐛 Solución de Problemas

### Error: "No se encontraron los certificados SSL"

**Solución:**
- Verificar que existan los archivos en `c:\Users\carlo\Desktop\DreamsApp\certs\`:
  - `server.crt`
  - `server.key`
- Revisar permisos de lectura de los archivos

### Error: "EADDRINUSE" (puerto en uso)

**Solución:**
```powershell
# Ver qué proceso usa el puerto 443
netstat -ano | findstr :443

# Terminar el proceso (reemplazar PID)
taskkill /PID <numero_pid> /F
```

### Error: "Cannot read property 'key' of null"

**Solución:**
- Los certificados no se cargaron correctamente
- Verificar que los archivos no estén corruptos
- Regenerar los certificados

### Advertencia de seguridad en el navegador (certificados autofirmados)

**Para desarrollo:**
1. Chrome: Escribir `thisisunsafe` cuando veas la advertencia
2. Firefox: Añadir excepción de seguridad manualmente
3. Edge: Click en "Avanzado" → "Continuar al sitio"

**Para producción:**
- Usar certificados de Let's Encrypt u otra CA reconocida

## 🔒 Seguridad

### Mejores Prácticas:

1. **No compartir certificados:**
   - Los archivos `.crt` y `.key` nunca deben estar en control de versiones
   - El `.gitignore` ya está configurado para excluirlos

2. **Permisos de archivos:**
   ```bash
   # Solo el propietario debe poder leer la clave privada
   icacls certs\server.key /inheritance:r /grant:r "%USERNAME%:R"
   ```

3. **Renovación de certificados:**
   - Los certificados de Let's Encrypt expiran cada 90 días
   - Configurar renovación automática

4. **CORS estricto en producción:**
   - Solo permitir orígenes HTTPS conocidos
   - Revisar la configuración de `CORS_ORIGINS` en `.env`

## 📱 Desarrollo Móvil en Red Local

Para aplicaciones móviles que trabajan en la misma red WiFi:

### Opción A: HTTP (Recomendado para desarrollo local)

El backend mantiene un servidor HTTP adicional en puerto 3001 específicamente para apps móviles:

1. **Configurar el backend:**
   ```env
   ENABLE_HTTP_MOBILE=true
   HTTP_API_PORT=3001
   ```

2. **En la app móvil, usar:**
   ```
   http://192.168.88.251:3001/api
   ```

3. **Ventajas:**
   - No requiere certificados SSL
   - Más simple para desarrollo
   - Funciona inmediatamente

**Ver guía completa:** [CONFIGURACION_APP_MOVIL.md](CONFIGURACION_APP_MOVIL.md)

### Opción B: HTTPS con certificado autofirmado

Si prefieres usar HTTPS en red local:

1. **Usar la IP local con puerto HTTPS:**
   ```
   https://192.168.88.251:3000/api
   ```

2. **Aceptar certificado autofirmado:**
   - En iOS: Settings → General → About → Certificate Trust Settings
   - En Android: Instalar el certificado manualmente

3. **Actualizar CORS si es necesario:**
   ```env
   CORS_ORIGINS=https://pedidos.cafeteriadreams.com,https://192.168.88.251
   ```

## 🔄 Desactivar HTTPS (Solo para Desarrollo)

Si necesitas volver temporalmente a HTTP:

```env
# En .env
USE_HTTPS=false
```

⚠️ **NO usar en producción**

## 📚 Referencias

- [Let's Encrypt](https://letsencrypt.org/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Node.js HTTPS Module](https://nodejs.org/api/https.html)
- [MDN: Transport Layer Security](https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security)

## ✅ Checklist Final

- [ ] Certificados SSL generados y copiados a `certs/`
- [ ] Archivo `.env` configurado con contraseñas correctas
- [ ] Puerto 443 y 3000 abiertos en el router
- [ ] DNS configurado para apuntar al servidor
- [ ] Backend iniciado sin errores
- [ ] Frontend iniciado sin errores
- [ ] Probado acceso desde https://pedidos.cafeteriadreams.com
- [ ] Verificada redirección automática de HTTP a HTTPS
- [ ] API funcionando en https://pedidos.cafeteriadreams.com:3000/api/health

---

**¡Felicidades! Tu aplicación ahora está corriendo de forma segura con HTTPS.** 🎉🔒
