-- Tabla de bonificaciones para sistema de puntos
-- Base de datos: DreamsApp

USE DreamsApp;

-- Tabla para almacenar bonificaciones y puntos por pedido
CREATE TABLE IF NOT EXISTS bonificaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  mesa_code VARCHAR(20) NOT NULL,
  total_ticket DECIMAL(10, 2) NOT NULL,
  puntos_acumulados INT NOT NULL,
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detalles TEXT DEFAULT NULL,
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_fecha (fecha_pedido),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para gestionar sesiones activas de clientes registrados
CREATE TABLE IF NOT EXISTS sesiones_clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  mesa_code VARCHAR(20) NOT NULL,
  sessionId VARCHAR(100) NOT NULL UNIQUE,
  inicio_sesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  activa BOOLEAN DEFAULT TRUE,
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_mesa_code (mesa_code),
  INDEX idx_sessionId (sessionId),
  INDEX idx_activa (activa),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ver puntos totales por cliente
CREATE OR REPLACE VIEW vista_puntos_clientes AS
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
GROUP BY c.id, c.nombre, c.alias, c.email;

-- Insertar datos de prueba (OPCIONAL)
-- INSERT INTO bonificaciones (cliente_id, mesa_code, total_ticket, puntos_acumulados, detalles) VALUES
-- (1, 'MESA01', 25.50, 25, 'Pedido de helados'),
-- (1, 'MESA01', 18.00, 18, 'Pedido de café');

-- Ver la vista
SELECT * FROM vista_puntos_clientes;
