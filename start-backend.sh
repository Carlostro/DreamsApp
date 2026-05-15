#!/bin/bash

echo "========================================"
echo "  DreamsApp - Iniciando Backend"
echo "========================================"
echo ""

cd my-api

echo "Verificando archivo .env..."
if [ ! -f .env ]; then
    echo "ERROR: Archivo .env no encontrado!"
    echo "Por favor crea el archivo .env con tus credenciales."
    echo "Usa .env.example como plantilla."
    exit 1
fi

echo "Iniciando servidor..."
echo ""
echo "Servidor disponible en:"
echo "  - http://localhost:3000"
echo "  - http://pedidos.cafeteriadreams.com:3000"
echo ""
echo "Presiona Ctrl+C para detener el servidor."
echo ""

node server.js
