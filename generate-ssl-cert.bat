@echo off
REM Script para generar certificados SSL autofirmados para desarrollo
REM Este script requiere OpenSSL instalado

echo ========================================
echo  Generador de Certificados SSL
echo  Para Desarrollo - DreamsApp
echo ========================================
echo.

REM Verificar si OpenSSL está instalado
where openssl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: OpenSSL no esta instalado o no esta en el PATH
    echo.
    echo Opciones para instalar OpenSSL:
    echo 1. Instalar Git para Windows (incluye OpenSSL): https://git-scm.com/download/win
    echo 2. Descargar OpenSSL: https://slproweb.com/products/Win32OpenSSL.html
    echo.
    echo Si ya lo instalaste, agrega la carpeta bin de OpenSSL al PATH del sistema.
    pause
    exit /b 1
)

echo OpenSSL encontrado:
openssl version
echo.

REM Crear carpeta certs si no existe
if not exist "certs" (
    mkdir certs
    echo Carpeta 'certs' creada
)

cd certs

echo.
echo Generando certificados SSL autofirmados...
echo.

REM Generar clave privada
echo [1/2] Generando clave privada (server.key)...
openssl genrsa -out server.key 2048
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo generar la clave privada
    pause
    exit /b 1
)
echo ✓ Clave privada generada

echo.
echo [2/2] Generando certificado autofirmado (server.crt)...
echo.
echo Por favor, completa la siguiente información:
echo (Puedes dejar los campos en blanco excepto Common Name)
echo.

REM Generar certificado
openssl req -new -x509 -key server.key -out server.crt -days 365 ^
    -subj "/C=ES/ST=Spain/L=City/O=DreamsApp/OU=Development/CN=pedidos.cafeteriadreams.com"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo generar el certificado
    pause
    exit /b 1
)

echo ✓ Certificado generado

cd ..

echo.
echo ========================================
echo  Certificados generados exitosamente
echo ========================================
echo.
echo Archivos creados:
echo - certs\server.key (Clave privada)
echo - certs\server.crt (Certificado)
echo.
echo ⚠ IMPORTANTE:
echo - Estos son certificados autofirmados para DESARROLLO
echo - Los navegadores mostraran advertencias de seguridad
echo - Para produccion, usa Let's Encrypt (ver certs\README.md)
echo.
echo Valido por: 365 dias
echo Common Name: pedidos.cafeteriadreams.com
echo.
echo Ahora puedes iniciar los servidores con:
echo   start-all.bat
echo.
pause
