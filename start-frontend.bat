@echo off
echo ========================================
echo   DreamsApp - Iniciando Frontend
echo ========================================
echo.

echo Verificando carpeta www...
if not exist www (
    echo ERROR: Carpeta www no encontrada!
    echo Por favor compila el frontend primero con: ionic build --prod
    pause
    exit /b 1
)

echo Iniciando servidor Frontend...
echo.
echo Frontend disponible en:
echo   - http://localhost:80
echo   - http://pedidos.cafeteriadreams.com
echo.
echo NOTA: Requiere permisos de administrador para puerto 80
echo Presiona Ctrl+C para detener el servidor.
echo.

node server-frontend.js
