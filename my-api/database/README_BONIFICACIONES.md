# Sistema de Bonificaciones y Puntos para Clientes

## 🎯 Resumen del Sistema

El sistema implementa dos tipos de sesiones:

1. **Sesiones Anónimas** → Usuarios que continúan sin registrar
   - Usan el sistema `active-tables` (control de mesas ocupadas)
   - No acumulan puntos ni bonificaciones

2. **Sesiones de Clientes Registrados** → Usuarios con login
   - Usan el sistema `sesiones_clientes` (tabla separada)
   - Acumulan puntos por cada pedido en tabla `bonificaciones`
   - Se trackean sus gastos totales y puntos

## 🗄️ Estructura de Base de Datos

### Tabla: `bonificaciones`
Almacena los puntos acumulados por cada pedido de clientes registrados.

```sql
CREATE TABLE bonificaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  mesa_code VARCHAR(20) NOT NULL,
  total_ticket DECIMAL(10, 2) NOT NULL,
  puntos_acumulados INT NOT NULL,
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detalles TEXT DEFAULT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

**Campos:**
- `cliente_id`: ID del cliente que hizo el pedido
- `mesa_code`: Código de la mesa donde se hizo el pedido
- `total_ticket`: Total del ticket en euros
- `puntos_acumulados`: Puntos ganados (1 punto = 1€)
- `fecha_pedido`: Fecha y hora del pedido
- `detalles`: Información adicional del pedido

### Tabla: `sesiones_clientes`
Controla las sesiones activas de clientes registrados (reemplaza active-tables para usuarios registrados).

```sql
CREATE TABLE sesiones_clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  mesa_code VARCHAR(20) NOT NULL,
  sessionId VARCHAR(100) NOT NULL UNIQUE,
  inicio_sesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activa BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

**Campos:**
- `cliente_id`: ID del cliente
- `mesa_code`: Código de la mesa
- `sessionId`: Identificador único de la sesión
- `activa`: Indica si la sesión está activa

### Vista: `vista_puntos_clientes`
Resumen de puntos totales por cliente.

```sql
CREATE VIEW vista_puntos_clientes AS
SELECT 
  c.id,
  c.nombre,
  c.alias,
  c.email,
  COUNT(b.id) as total_pedidos,
  SUM(b.total_ticket) as gasto_total,
  SUM(b.puntos_acumulados) as puntos_totales
FROM clientes c
LEFT JOIN bonificaciones b ON c.id = b.cliente_id
GROUP BY c.id;
```

## 🔧 Instalación

1. **Crear las tablas:**
```bash
mysql -u root -p DreamsApp < my-api/database/bonificaciones.sql
```

2. **Reiniciar el servidor:**
```bash
cd my-api
npm start
```

## 🔌 Endpoints API

### Sesiones de Clientes

#### 1. Crear Sesión de Cliente
```http
POST /api/sesiones-clientes
Content-Type: application/json

{
  "cliente_id": 1,
  "mesa_code": "MESA01",
  "sessionId": "MESA01_1234567890_cliente_1"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sesión creada exitosamente",
  "sesion_id": 1
}
```

#### 2. Cerrar Sesión de Cliente
```http
DELETE /api/sesiones-clientes/:sessionId
```

#### 3. Obtener Sesión Activa
```http
GET /api/sesiones-clientes/activa/:cliente_id
```

### Bonificaciones

#### 1. Registrar Bonificación
```http
POST /api/bonificaciones
Content-Type: application/json

{
  "cliente_id": 1,
  "mesa_code": "MESA01",
  "total_ticket": 25.50,
  "detalles": "Pedido de helados"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Bonificación registrada",
  "bonificacion_id": 1,
  "puntos_ganados": 25
}
```

**Regla de Puntos:** 1 punto por cada euro gastado (se redondea hacia abajo)
- 25.50€ → 25 puntos
- 18.00€ → 18 puntos

#### 2. Obtener Puntos Totales
```http
GET /api/bonificaciones/puntos/:cliente_id
```

**Respuesta:**
```json
{
  "success": true,
  "puntos": {
    "id": 1,
    "nombre": "Juan Pérez",
    "alias": "juanperez1234",
    "email": "juan@example.com",
    "total_pedidos": 5,
    "gasto_total": 127.50,
    "puntos_totales": 127
  }
}
```

#### 3. Obtener Historial de Bonificaciones
```http
GET /api/bonificaciones/historial/:cliente_id
```

**Respuesta:**
```json
{
  "success": true,
  "bonificaciones": [
    {
      "id": 1,
      "cliente_id": 1,
      "mesa_code": "MESA01",
      "total_ticket": 25.50,
      "puntos_acumulados": 25,
      "fecha_pedido": "2026-01-30T10:30:00.000Z",
      "detalles": "Pedido de helados"
    }
  ]
}
```

## 📱 Flujo de la Aplicación

### Usuario Anónimo
```
1. Escanea QR → Loading
2. Verifica ubicación → Muestra botones
3. Click "Continuar sin registrar"
4. Sistema verifica active-tables
5. Crea sesión en active-tables
6. localStorage.sessionType = 'anonimo'
7. Navega a página de selección
8. NO acumula puntos
```

### Usuario Registrado (Login)
```
1. Escanea QR → Loading
2. Verifica ubicación → Muestra botones
3. Click "Iniciar Sesión"
4. Ingresa alias y password
5. Valida en BD clientes
6. Crea sesión en sesiones_clientes (NO en active-tables)
7. localStorage.sessionType = 'cliente'
8. localStorage.userId = cliente_id
9. Navega a página de selección
10. Al finalizar pedido → Guarda en bonificaciones
```

### Usuario Nuevo (Registro)
```
1. Escanea QR → Loading
2. Verifica ubicación → Muestra botones
3. Click "Registrarse"
4. Ingresa nombre, email, password
5. Se guarda en BD clientes
6. Se genera alias único
7. Crea sesión en sesiones_clientes
8. localStorage.sessionType = 'cliente'
9. localStorage.userId = cliente_id
10. Navega a página de selección
11. Al finalizar pedido → Guarda en bonificaciones
```

## 💾 LocalStorage

El sistema utiliza las siguientes claves:

**Para todos los usuarios:**
- `sessionId`: ID de la sesión
- `sessionType`: `'anonimo'` o `'cliente'`

**Solo para clientes registrados:**
- `userId`: ID del cliente
- `userAlias`: Alias del cliente
- `userName`: Nombre del cliente
- `userEmail`: Email del cliente
- `userLoggedIn`: `'true'` si está logueado

## 🎮 Uso en el Frontend

### Verificar tipo de sesión
```typescript
const sessionType = localStorage.getItem('sessionType');

if (sessionType === 'cliente') {
  // Usuario registrado - puede acumular puntos
  const userId = localStorage.getItem('userId');
  console.log('Cliente registrado:', userId);
} else {
  // Usuario anónimo
  console.log('Usuario anónimo');
}
```

### Registrar bonificación al finalizar pedido
```typescript
// En el componente donde se finaliza el pedido
const sessionType = localStorage.getItem('sessionType');

if (sessionType === 'cliente') {
  const clienteId = parseInt(localStorage.getItem('userId') || '0');
  const mesaCode = '...'; // Código de la mesa actual
  const totalTicket = 25.50; // Total del pedido

  this.clientesService.registrarBonificacion(
    clienteId, 
    mesaCode, 
    totalTicket, 
    'Pedido completado'
  ).subscribe(response => {
    if (response.success) {
      console.log('¡Ganaste ' + response.puntos_ganados + ' puntos!');
      // Mostrar mensaje al usuario
    }
  });
}
```

### Mostrar puntos del cliente
```typescript
const clienteId = parseInt(localStorage.getItem('userId') || '0');

this.clientesService.obtenerPuntosCliente(clienteId).subscribe(response => {
  if (response.success) {
    console.log('Puntos totales:', response.puntos.puntos_totales);
    console.log('Pedidos realizados:', response.puntos.total_pedidos);
    console.log('Gasto total:', response.puntos.gasto_total);
  }
});
```

## 🔒 Diferencias Clave

| Aspecto | Usuario Anónimo | Cliente Registrado |
|---------|-----------------|-------------------|
| Control de mesa | `active-tables` | `sesiones_clientes` |
| Identificación | Solo por mesa | Por cliente + mesa |
| Puntos | No acumula | Acumula puntos |
| Bonificaciones | No | Sí, en tabla `bonificaciones` |
| sessionType | `'anonimo'` | `'cliente'` |
| userId | No tiene | Tiene ID de cliente |

## 📊 Consultas SQL Útiles

```sql
-- Ver puntos de un cliente
SELECT * FROM vista_puntos_clientes WHERE id = 1;

-- Ver historial de bonificaciones
SELECT * FROM bonificaciones WHERE cliente_id = 1 ORDER BY fecha_pedido DESC;

-- Ver sesiones activas de clientes
SELECT * FROM sesiones_clientes WHERE activa = TRUE;

-- Ver top 10 clientes por puntos
SELECT * FROM vista_puntos_clientes ORDER BY puntos_totales DESC LIMIT 10;

-- Ver sesiones de hoy
SELECT * FROM sesiones_clientes 
WHERE DATE(inicio_sesion) = CURDATE();
```

## 🚀 Próximas Mejoras

- [ ] Implementar canje de puntos por descuentos
- [ ] Sistema de niveles (bronce, plata, oro)
- [ ] Notificaciones de puntos ganados
- [ ] Dashboard de puntos en la app
- [ ] Exportar historial de bonificaciones
- [ ] API para admin para ver estadísticas
