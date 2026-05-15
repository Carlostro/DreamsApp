# Configuración de la Base de Datos de Clientes

## 📋 Resumen
Se ha implementado un sistema completo de registro e inicio de sesión para clientes que utiliza una base de datos MySQL.

## 🗄️ Crear la Tabla de Clientes

### Opción 1: Ejecutar el script SQL
1. Abre MySQL Workbench o tu cliente MySQL preferido
2. Conéctate a la base de datos `DreamsApp`
3. Ejecuta el archivo SQL:
   ```bash
   mysql -u root -p DreamsApp < my-api/database/clientes.sql
   ```

### Opción 2: Ejecutar manualmente
```sql
USE DreamsApp;

CREATE TABLE IF NOT EXISTS clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  alias VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_alias (alias)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔧 Estructura de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Identificador único (auto-incremental) |
| `nombre` | VARCHAR(100) | Nombre completo del cliente |
| `email` | VARCHAR(150) | Correo electrónico (único) |
| `alias` | VARCHAR(50) | Alias generado automáticamente (único) |
| `password` | VARCHAR(255) | Contraseña (debería estar hasheada) |
| `telefono` | VARCHAR(20) | Teléfono (opcional) |
| `createdAt` | TIMESTAMP | Fecha de registro |
| `updatedAt` | TIMESTAMP | Fecha de última actualización |

## 🔌 Endpoints Disponibles

### 1. Registrar Cliente
```http
POST /api/clientes/registro
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Registro exitoso",
  "cliente": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "alias": "juanperez1234",
    "createdAt": "2026-01-30T10:30:00.000Z"
  },
  "alias": "juanperez1234"
}
```

### 2. Iniciar Sesión
```http
POST /api/clientes/login
Content-Type: application/json

{
  "alias": "juanperez1234",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "cliente": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "alias": "juanperez1234",
    "createdAt": "2026-01-30T10:30:00.000Z"
  }
}
```

### 3. Obtener Cliente por ID
```http
GET /api/clientes/:id
```

### 4. Verificar Email
```http
GET /api/clientes/verificar-email/:email
```

## 🔐 Seguridad

### ⚠️ IMPORTANTE - Para Producción:
Actualmente las contraseñas se almacenan en texto plano. **Esto NO es seguro para producción.**

### Implementar Bcrypt (Recomendado):

1. Instalar bcrypt:
   ```bash
   cd my-api
   npm install bcrypt
   ```

2. Actualizar el código de registro en `server.js`:
   ```javascript
   const bcrypt = require('bcrypt');
   
   // En el endpoint de registro:
   const hashedPassword = await bcrypt.hash(password, 10);
   // Usar hashedPassword en lugar de password
   ```

3. Actualizar el código de login:
   ```javascript
   // En el endpoint de login:
   const isValid = await bcrypt.compare(password, cliente.password);
   if (!isValid) {
     return res.status(401).json({
       success: false,
       message: 'Alias o contraseña incorrectos'
     });
   }
   ```

## 🧪 Probar los Endpoints

### Con cURL:
```bash
# Registrar
curl -X POST http://pedidos.cafeteriadreams.com/api/clientes/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://pedidos.cafeteriadreams.com/api/clientes/login \
  -H "Content-Type: application/json" \
  -d '{"alias":"testuser1234","password":"test123"}'
```

### Con Postman:
1. Crear nueva petición POST
2. URL: `http://pedidos.cafeteriadreams.com/api/clientes/registro`
3. Headers: `Content-Type: application/json`
4. Body (raw, JSON):
   ```json
   {
     "nombre": "Test User",
     "email": "test@example.com",
     "password": "test123"
   }
   ```

## 📱 Flujo de la Aplicación

1. **Usuario escanea QR** → Página de loading
2. **Verifica ubicación GPS** → Muestra botones
3. **Usuario elige:**
   - **Iniciar Sesión** → Ingresa alias y contraseña → Valida en BD
   - **Registrarse** → Ingresa nombre, email, contraseña → Guarda en BD → Genera alias
   - **Continuar sin registrar** → Acceso directo (usuario anónimo)
4. **Redirección** → Página de selección

## 📊 Verificar los Datos

```sql
-- Ver todos los clientes
SELECT id, nombre, email, alias, createdAt FROM clientes;

-- Buscar por email
SELECT * FROM clientes WHERE email = 'juan@example.com';

-- Buscar por alias
SELECT * FROM clientes WHERE alias = 'juanperez1234';

-- Contar clientes registrados
SELECT COUNT(*) as total_clientes FROM clientes;
```

## 🔄 Integración con el Frontend

Los componentes ya están actualizados:
- ✅ `LoginUsersComponent` - Usa `ClientesService.loginCliente()`
- ✅ `RegistroComponent` - Usa `ClientesService.registrarCliente()`
- ✅ `ClientesService` - Maneja todas las llamadas HTTP

## 📝 Notas Adicionales

- El alias se genera automáticamente a partir del nombre + números aleatorios
- El sistema verifica que el alias sea único antes de registrar
- Se valida que el email no esté duplicado
- Los datos del cliente se guardan en `localStorage` tras login/registro exitoso
- El token de autenticación se puede implementar con JWT en el futuro

## 🚀 Siguientes Pasos

1. ✅ Crear tabla de clientes
2. ✅ Implementar endpoints de registro/login
3. ✅ Integrar frontend con backend
4. 🔲 Implementar bcrypt para hashear contraseñas
5. 🔲 Añadir JWT para tokens de autenticación
6. 🔲 Implementar recuperación de contraseña
7. 🔲 Añadir validación de email por correo
