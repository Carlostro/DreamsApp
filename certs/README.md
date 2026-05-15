# Certificados SSL para HTTPS

Esta carpeta debe contener los certificados SSL para habilitar HTTPS en la aplicación.

## Opción 1: Certificado de Let's Encrypt (Producción - Recomendado)

Para obtener un certificado gratuito y válido de Let's Encrypt:

### En Windows con Certbot:

1. Descargar Certbot desde: https://certbot.eff.org/
2. Ejecutar el siguiente comando (reemplazar tu dominio):

```bash
certbot certonly --standalone -d pedidos.cafeteriadreams.com
```

3. Los certificados se generarán en: `C:\Certbot\live\pedidos.cafeteriadreams.com\`
4. Copiar los archivos a esta carpeta:
   - `fullchain.pem` → copiar como `server.crt`
   - `privkey.pem` → copiar como `server.key`

### Renovación automática:
Los certificados de Let's Encrypt duran 90 días. Certbot puede renovarlos automáticamente:

```bash
certbot renew
```

## Opción 2: Certificado Autofirmado (Desarrollo)

Para desarrollo local, puedes crear un certificado autofirmado:

### En Windows con OpenSSL:

1. Instalar OpenSSL (viene con Git Bash o descargar desde https://slproweb.com/products/Win32OpenSSL.html)
2. Ejecutar:

```bash
cd c:\Users\carlo\Desktop\DreamsApp\certs
openssl genrsa -out server.key 2048
openssl req -new -x509 -key server.key -out server.crt -days 365
```

3. Al ejecutar el segundo comando, se te pedirá información. Lo importante es:
   - Common Name (CN): pedidos.cafeteriadreams.com

**Nota**: Los certificados autofirmados mostrarán una advertencia en el navegador.

## Archivos necesarios:

- `server.key` - Clave privada SSL
- `server.crt` - Certificado SSL

## Seguridad:

⚠️ **IMPORTANTE**: 
- Nunca subir estos archivos a un repositorio público
- El archivo `.gitignore` ya está configurado para ignorar estos archivos
- Mantener permisos restrictivos en estos archivos

## Renovación:

Para Let's Encrypt, configurar una tarea programada en Windows para renovar cada 60 días:

```bash
certbot renew --quiet
```

Luego copiar los nuevos certificados a esta carpeta.
