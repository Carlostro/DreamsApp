// Servidor Web para Frontend con HTTPS
// Este servidor sirve archivos estáticos y hace proxy manual de las peticiones API
// Fuerza HTTPS y redirige todo el tráfico HTTP a HTTPS

const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const HTTP_PORT = process.env.HTTP_PORT || 80;
const API_PORT = process.env.PORT || 3000;
const USE_HTTPS = process.env.USE_HTTPS === 'true'; // Por defecto false, solo si tiene certificados

// Configurar Express para confiar en el proxy/túnel
app.set('trust proxy', true);
app.enable('trust proxy');

// Cargar certificados SSL (opcional)
let sslOptions = null;
if (USE_HTTPS) {
  const certPath = path.join(__dirname, 'certs', 'server.crt');
  const keyPath = path.join(__dirname, 'certs', 'server.key');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    console.log('[SSL] Certificados cargados correctamente');
  } else {
    console.warn('[SSL WARNING] No se encontraron certificados SSL');
    console.warn('[SSL WARNING] El servidor HTTPS no estará disponible');
    console.warn('[SSL WARNING] Solo se iniciará el servidor HTTP');
  }
}

// Middleware para headers de seguridad compatible con iOS y túneles
app.use((req, res, next) => {
  // Detectar si la petición viene por HTTPS (del túnel)
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;

  // Headers de seguridad para iOS
  if (protocol === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Para archivos estáticos de Angular
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.url === '/index.html' || req.url === '/') {
    // No cachear index.html para iOS
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
});

// Proxy manual para las peticiones /api/* hacia el backend (HTTP por defecto)
app.use('/api', (req, res) => {
  const targetPath = '/api' + req.url;
  console.log(`[PROXY] ${req.method} ${targetPath} -> http://localhost:${API_PORT}${targetPath}`);

  // Preparar los headers - preservar headers importantes del túnel
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;

  // Preservar información del túnel para el backend
  if (req.headers['x-forwarded-for']) {
    headers['x-forwarded-for'] = req.headers['x-forwarded-for'];
  }
  if (req.headers['x-forwarded-proto']) {
    headers['x-forwarded-proto'] = req.headers['x-forwarded-proto'];
  }
  if (req.headers['x-real-ip']) {
    headers['x-real-ip'] = req.headers['x-real-ip'];
  }

  const options = {
    hostname: 'localhost',
    port: API_PORT,
    path: targetPath,
    method: req.method,
    headers: headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Copiar headers de la respuesta
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });

    // Asegurar Content-Type para iOS
    if (!res.getHeader('Content-Type') && proxyRes.headers['content-type']) {
      res.setHeader('Content-Type', proxyRes.headers['content-type']);
    }

    res.statusCode = proxyRes.statusCode;
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        error: 'Error al conectar con el backend',
        message: err.message,
        backend: `http://localhost:${API_PORT}${targetPath}`
      });
    }
  });

  // Timeout para iOS (30 segundos)
  proxyReq.setTimeout(30000, () => {
    if (!res.headersSent) {
      console.error('[PROXY TIMEOUT]', targetPath);
      res.status(504).json({ error: 'Backend timeout' });
    }
    proxyReq.abort();
  });

  // Pasar el body de la petición al backend
  req.pipe(proxyReq);
});

// Servir archivos estáticos de la carpeta 'www' (Angular compilado)
app.use(express.static(path.join(__dirname, 'www'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    // Headers específicos para iOS
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filepath.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Redirigir todas las rutas restantes al index.html (para el routing de Angular)
// IMPORTANTE: Este middleware debe estar al FINAL, captura todo lo que no sea /api
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

// Iniciar servidor(es)
if (USE_HTTPS && sslOptions) {
  // Servidor HTTP que redirige a HTTPS
  const httpApp = express();

  httpApp.use((req, res) => {
    const host = req.headers.host.replace(/:\d+$/, '');
    const httpsUrl = `https://${host}${req.url}`;
    console.log(`[HTTP→HTTPS] Redirigiendo: ${req.url} → ${httpsUrl}`);
    res.redirect(301, httpsUrl);
  });

  http.createServer(httpApp).listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`[HTTP] Servidor de redirección activo en puerto ${HTTP_PORT}`);
  });

  // Servidor HTTPS principal
  https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`===========================================`);
    console.log(`  Frontend Server HTTPS + API Proxy`);
    console.log(`===========================================`);
    console.log(`Puerto HTTPS: ${HTTPS_PORT}`);
    console.log(`Puerto HTTP (redirección): ${HTTP_PORT}`);
    console.log(`Frontend: https://pedidos.cafeteriadreams.com`);
    console.log(`API Proxy: /api -> http://localhost:${API_PORT}/api`);
    console.log(`===========================================`);
    console.log(`Backend HTTP en puerto ${API_PORT}`);
    console.log(`===========================================`);
  });
} else {
  // Modo HTTP (compatible con configuración actual)
  app.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`===========================================`);
    console.log(`  Frontend Server HTTP + API Proxy`);
    console.log(`===========================================`);
    console.log(`Puerto: ${HTTP_PORT}`);
    console.log(`Frontend: http://localhost:${HTTP_PORT}`);
    console.log(`API Proxy: /api -> http://localhost:${API_PORT}/api`);
    console.log(`===========================================`);
    console.log(`📱 Compatible con APK actual`);
    console.log(`===========================================`);
  });
}
