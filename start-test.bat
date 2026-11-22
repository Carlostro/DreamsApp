@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo   DreamsApp - Entorno local de pruebas
echo ========================================

node -e "const [major,minor,patch]=process.versions.node.split('.').map(Number);if(major!==22||minor<22||(minor===22&&patch<3)){console.error('Se requiere Node 22.22.3 o superior dentro de la linea 22.');process.exit(1)}"
if errorlevel 1 exit /b 1

if not exist "my-api\.env.test" (
  echo ERROR: Falta my-api\.env.test.
  echo Copia my-api\.env.test.example a my-api\.env.test y configura
  echo credenciales de bases de datos de prueba desechables.
  exit /b 1
)

node -e "const fs=require('fs');const e=require('dotenv').parse(fs.readFileSync('my-api/.env.test'));const names=[e.DB_NAME,e.DB_TICKETS_NAME].map(x=>(x||'').toLowerCase());const credentials=[e.DB_USER,e.DB_PASSWORD,e.DB_TICKETS_USER,e.DB_TICKETS_PASSWORD];if(e.NODE_ENV!=='test'||!names.every(x=>x.includes('test'))||credentials.some(x=>!x||x.startsWith('REPLACE_'))){console.error('Configuracion insegura: define NODE_ENV=test, nombres de bases que incluyan test y credenciales de prueba.');process.exit(1)}"
if errorlevel 1 exit /b 1

if not exist "www\index.html" (
  echo No se encontro www\index.html. Compilando frontend...
  call npm run build
  if errorlevel 1 exit /b 1
)

echo Iniciando API en http://localhost:3100 y frontend en http://localhost:8080
start "DreamsApp API - pruebas" cmd /k "cd /d ""%~dp0my-api"" && set ""PORT=3100"" && set ""NODE_ENV=test"" && set ""DOTENV_CONFIG_PATH=.env.test"" && node server.js"
timeout /t 2 /nobreak > nul
start "DreamsApp Frontend - pruebas" cmd /k "cd /d ""%~dp0"" && set ""PORT=3100"" && set ""HTTP_PORT=8080"" && set ""USE_HTTPS=false"" && node server-frontend.js"
