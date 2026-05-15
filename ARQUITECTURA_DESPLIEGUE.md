# 🚀 Arquitectura de Despliegue - DreamsApp

## 📊 Estructura de Puertos

```
┌─────────────────────────────────────────┐
│  Internet / Router                      │
│  pedidos.cafeteriadreams.com           │
└─────────────────────────────────────────┘
              │
              ├─── Puerto 80 ──────► Frontend (Angular/Ionic)
              │                      http://pedidos.cafeteriadreams.com
              │
              └─── Puerto 3000 ────► API Backend (Express)
                                     http://pedidos.cafeteriadreams.com:3000
```

## 🔧 Configuración del Router

### **Port Forwarding requerido:**

| Puerto Externo | Puerto Interno | Servicio | Protocolo |
|----------------|----------------|----------|-----------|
| 80 | 80 | Frontend Web | HTTP |
| 3000 | 3000 | API Backend | HTTP |

## 🎯 URLs de Acceso

### **Desde Internet:**
```
Frontend:  http://pedidos.cafeteriadreams.com
API:       http://pedidos.cafeteriadreams.com:3000/api
```

### **Desde Red Local:**
```
Frontend:  http://localhost:80
API:       http://localhost:3000/api
```

## 🚀 Cómo Iniciar la Aplicación

### **Opción 1: Iniciar Todo (Recomendado)**

```bash
# Windows (como Administrador)
start-all.bat
```

### **Opción 2: Iniciar Servicios por Separado**

```bash
# Terminal 1 - API Backend
start-backend.bat

# Terminal 2 - Frontend Web (como Administrador)
start-frontend.bat
```

### **Opción 3: Comandos npm**

```bash
# Compilar frontend
npm run build

# Iniciar API
npm run start:api

# Iniciar Frontend (requiere admin)
npm run start:frontend
```

## ⚠️ Importante: Permisos de Administrador

**El puerto 80 requiere permisos de administrador en Windows.**

Para ejecutar sin admin, puedes:
1. Usar puerto alternativo (ej: 8080) y configurar redireccionamiento en router
2. Usar IIS o nginx como proxy reverso

## 📁 Estructura de Archivos

```
DreamsApp/
├── www/                    # Frontend compilado (Angular)
├── my-api/
│   ├── server.js          # API Backend (Puerto 3000)
│   ├── .env               # Configuración
│   └── package.json
├── server-frontend.js     # Servidor Frontend (Puerto 80)
├── start-backend.bat      # Script para API
├── start-frontend.bat     # Script para Frontend
└── start-all.bat          # Script para todo
```

## 🔄 Flujo de Despliegue

### **1. Compilar Frontend**
```bash
ionic build --prod
```
Esto genera los archivos en `/www`

### **2. Configurar Variables de Entorno**
Edita `my-api/.env`:
```env
PORT=3000
FRONTEND_PORT=80
DOMAIN=pedidos.cafeteriadreams.com
```

### **3. Iniciar Servidores**
```bash
# Como administrador
start-all.bat
```

### **4. Verificar**
- Frontend: http://localhost
- API: http://localhost:3000/api/tables

## 🌐 Comunicación Frontend ↔ Backend

El frontend (puerto 80) hace peticiones al backend (puerto 3000):

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'http://pedidos.cafeteriadreams.com:3000/api',
  apiBaseUrl: 'http://pedidos.cafeteriadreams.com:3000'
};
```

CORS está configurado en el backend para permitir requests desde:
- `http://pedidos.cafeteriadreams.com`
- `https://pedidos.cafeteriadreams.com`

## 🔒 Seguridad

### **Actual (HTTP):**
```
✅ Puerto 80: Frontend
✅ Puerto 3000: API
❌ Sin encriptación SSL
```

### **Recomendado (HTTPS):**
```
✅ Puerto 443: Frontend (SSL)
✅ Puerto 3000: API (con SSL)
✅ Certificado Let's Encrypt
```

## 🐛 Solución de Problemas

### **Error: Puerto 80 en uso**
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :80

# Detener el proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### **Error: Permisos en Puerto 80**
Ejecuta el script como Administrador:
- Click derecho → "Ejecutar como administrador"

### **Error: CORS**
Verifica que `my-api/.env` tenga:
```env
CORS_ORIGINS=http://pedidos.cafeteriadreams.com,https://pedidos.cafeteriadreams.com
```

### **Frontend no carga**
1. Verifica que `/www` exista: `ionic build --prod`
2. Verifica que `server-frontend.js` esté corriendo
3. Revisa logs en la consola

### **API no responde**
1. Verifica que MySQL esté corriendo
2. Verifica credenciales en `my-api/.env`
3. Revisa logs del servidor

## 📝 Checklist de Despliegue

- [ ] Compilar frontend: `ionic build --prod`
- [ ] Configurar `.env` con credenciales correctas
- [ ] Configurar port forwarding en router (80 y 3000)
- [ ] Iniciar MySQL
- [ ] Iniciar API Backend (puerto 3000)
- [ ] Iniciar Frontend Web (puerto 80)
- [ ] Probar acceso local
- [ ] Probar acceso desde internet
- [ ] Verificar CORS
- [ ] Verificar logs de errores

## 🎯 URLs Finales

Una vez todo configurado:

```
✅ Frontend Web:    http://pedidos.cafeteriadreams.com
✅ API Backend:     http://pedidos.cafeteriadreams.com:3000/api
✅ Admin Panel:     http://pedidos.cafeteriadreams.com/admin
✅ Tickets:         http://pedidos.cafeteriadreams.com:3000/api/tickets
```

---

**Fecha:** 17 de enero de 2026
**Versión:** 2.0 - Arquitectura Separada
