-- Script para agregar la columna 'autorizacion' a la tabla clientes existente
-- Ejecutar este script en la base de datos DreamsApp

USE DreamsApp;

-- Verificar si la columna ya existe antes de agregarla
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS autorizacion TINYINT(1) DEFAULT 0
COMMENT 'Autorización para envío de promos y ofertas'
AFTER telefono;

-- Verificar el resultado
DESCRIBE clientes;

-- Mostrar los datos actuales (opcional)
SELECT id, nombre, email, alias, autorizacion, createdAt FROM clientes;
