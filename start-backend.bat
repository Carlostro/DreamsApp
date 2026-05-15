@echo off
echo ========================================
echo   DreamsApp - Iniciando API Backend
echo ========================================
echo.

cd my-api

echo Verificando archivo .env...
if not exist .env (
    echo ERROR: Archivo .env no encontrado!
    echo Por favor crea el archivo .env con tus credenciales.
    echo Usa .env.example como plantilla.
    pause
    exit /b 1
)

echo Iniciando servidor API...
echo.
echo API disponible en:
echo   - http://localhost:3000/api
echo   - http://pedidos.cafeteriadreams.com:3000/api
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.

node server.js
