# DreamsApp - Configuración de Dominio con Túnel HTTPS

## 🌐 Arquitectura de Red

```
Internet (HTTPS) → Túnel/Router (terminación SSL) → Servidor Local (HTTP:3000)
Red Local (HTTP) → Servidor Local (HTTP:3000)
```

El sistema usa **terminación SSL en el túnel**, por lo que:
- **Desde Internet**: `https://pedidos.cafeteriadreams.com` → El túnel/router convierte a HTTP → Backend puerto 3000
- **Desde red local**: `http://192.168.x.x:3000` → Conexión directa HTTP → Backend puerto 3000

**No se necesitan certificados SSL en el servidor Node.js** - el túnel maneja HTTPS automáticamente.

## 📋 Requisitos Previos

- Node.js instalado
- MySQL instalado y configurado
- Túnel configurado en el router (ya convierte HTTPS → HTTP)
- Puerto 3000 abierto en el router hacia el servidor local

## 🔧 Configuración del Backend

### 1. Configurar variables de entorno

Copia el archivo de ejemplo y edita las credenciales:

```bash
cd my-api
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Dominio público (con túnel HTTPS)
DOMAIN=pedidos.cafeteriadreams.com
API_URL=http://pedidos.cafeteriadreams.com:3000

# NO habilitar HTTPS en Node.js - el túnel maneja SSL
USE_HTTPS=false

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu-password-segura
DB_NAME=DreamsApp

# Base de datos de tickets
DB_TICKETS_HOST=localhost
DB_TICKETS_USER=root
DB_TICKETS_PASSWORD=tu-password-segura
DB_TICKETS_NAME=TicketsDB

# Plugin de impresión (IP local)
PRINTER_PLUGIN_URL=http://192.168.88.251:8000

# CORS - Permitir ambos protocolos (el túnel convierte HTTPS a HTTP)
CORS_ORIGINS=http://pedidos.cafeteriadreams.com,https://pedidos.cafeteriadreams.com,http://localhost,https://localhost
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor

```bash
node server.js
```

## 🌐 Configuración del Frontend (Angular/Ionic)

### 1. Configurar entornos

Los archivos de entorno ya están configurados en:
- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción)

Si necesitas cambiar el dominio, edita estos archivos.

### 2. Instalar dependencias

```bash
npm install
```

### 3. Compilar para producción

```bash
ionic build --prod
```

## 🛠️ Configuración del Router

### Redireccionamiento de puertos

Configura tu router para:

1. **Puerto 3000** → Servidor interno donde corre el backend
2. **Puerto 80 (opcional)** → Para servir el frontend

### DNS/DynDNS

Asegúrate de que tu dominio `pedidos.cafeteriadreams.com` apunta a tu IP pública.

Si tienes IP dinámica, usa servicios como:
- No-IP
- DuckDNS
- DynDNS

## 🔒 Seguridad

### Proteger credenciales

**NUNCA** subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

### Recomendaciones adicionales:

1. Usar HTTPS con certificado SSL (Let's Encrypt)
2. Implementar rate limiting
3. Usar contraseñas seguras para MySQL
4. Habilitar firewall en el servidor
5. Mantener las dependencias actualizadas

## 🚀 Despliegue

### Opción 1: Servidor local con tunelización

1. Configura el router con port forwarding
2. Inicia el backend: `node my-api/server.js`
3. Accede desde: `http://pedidos.cafeteriadreams.com:3000`

### Opción 2: Usar PM2 (recomendado)

```bash
npm install -g pm2
cd my-api
pm2 start server.js --name dreamsapp-api
pm2 save
pm2 startup
```

## 📝 Notas Importantes

- El plugin de impresión usa la IP local `192.168.88.251:8000` (no es accesible desde fuera)
- El frontend se conecta al backend usando el dominio público
- La base de datos permanece en `localhost` (no está expuesta externamente)

## 🔍 Solución de Problemas

### El backend no es accesible desde fuera

1. Verifica que el puerto 3000 esté abierto en el router
2. Comprueba el firewall del servidor
3. Verifica la configuración DNS

### Error de CORS

Asegúrate de que `CORS_ORIGINS` en `.env` incluye tu dominio completo.

### Error de conexión a MySQL

Verifica las credenciales en el archivo `.env`

## 📞 Soporte

Para problemas o dudas, contacta al equipo de desarrollo.
