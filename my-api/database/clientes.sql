-- Tabla de clientes para el sistema de login/registro
-- Base de datos: DreamsApp

USE DreamsApp;

CREATE TABLE IF NOT EXISTS clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  alias VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  autorizacion TINYINT(1) DEFAULT 0 COMMENT 'Autorización para envío de promos y ofertas',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_alias (alias)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar algunos clientes de prueba (OPCIONAL - comentar en producción)
-- Las contraseñas deberían estar hasheadas en un entorno real
INSERT INTO clientes (nombre, email, alias, password) VALUES
('Usuario Demo', 'demo@test.com', 'demo1234', 'password123'),
('Juan Pérez', 'juan@test.com', 'juanperez5678', 'password123'),
('María García', 'maria@test.com', 'mariagarcia9012', 'password123');

-- Verificar la tabla
SELECT * FROM clientes;
