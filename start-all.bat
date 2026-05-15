@echo off
echo ========================================
echo   DreamsApp - Iniciando TODO
echo ========================================
echo.
echo Este script inicia:
echo   1. API Backend (Puerto 3000)
echo   2. Frontend Web (Puerto 80)
echo.
echo NOTA: Requiere permisos de administrador
echo.
pause

start "API Backend" cmd /k "cd my-api && node server.js"
timeout /t 2 /nobreak > nul
start "Frontend Web" cmd /k "node server-frontend.js"

echo.
echo Servidores iniciados en ventanas separadas
echo.
pause
