"use strict";

// Cargar variables de entorno
require('dotenv').config();

const express = require("express");

const fs = require('fs');

const bodyParser = require('body-parser');

const path = require('path');

const mysql = require("mysql2");

const bcrypt = require('bcrypt');

const app = express();

const cors = require("cors");

const http = require('http');

const https = require('https');

const httpPort = process.env.PORT || 3000; // Puerto 3000 para HTTP (app móvil + dominio)

const httpsPort = process.env.HTTPS_API_PORT || 3443; // Puerto 3443 para HTTPS (opcional)

const USE_HTTPS = process.env.USE_HTTPS === 'true'; // Por defecto false, solo si tiene certificados

let pedidoCounter = 0; // Inicializar el contador
// Configurar Express para confiar en el proxy/túnel
// Esto es crítico para que funcione correctamente con túneles HTTPS

app.set('trust proxy', true);
app.enable('trust proxy'); // Cargar certificados SSL (opcional - solo si se quiere HTTPS adicional)

let sslOptions = null;

if (USE_HTTPS) {
  const certPath = path.join(__dirname, '..', 'certs', 'server.crt');
  const keyPath = path.join(__dirname, '..', 'certs', 'server.key');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    console.log('[SSL] Certificados cargados correctamente');
  } else {
    console.warn('[SSL WARNING] No se encontraron certificados SSL');
    console.warn('[SSL WARNING] El servidor HTTPS no estará disponible');
  }
} // Obtener orígenes permitidos desde el .env


const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://pedidos.cafeteriadreams.com', 'https://pedidos.cafeteriadreams.com', 'http://localhost', 'https://localhost']; // Habilitar CORS - Configuración mejorada para iOS y túneles HTTPS

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (navegación directa, apps móviles, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    } // Permitir si está en la lista de orígenes permitidos


    if (allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed))) {
      return callback(null, true);
    } // Permitir localhost y red local (para desarrollo y app móvil)


    if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?/.test(origin)) {
      return callback(null, true);
    } // Para desarrollo, permitir todos los orígenes


    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } // Rechazar otros orígenes


    console.warn('[CORS] Origen no permitido:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Forwarded-For', 'X-Forwarded-Proto', 'X-Forwarded-Host', 'Accept', 'Accept-Language', 'Accept-Encoding', 'Origin', 'Referer', 'User-Agent'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  maxAge: 86400,
  // 24 horas - cache de preflight para iOS
  preflightContinue: false,
  optionsSuccessStatus: 204 // iOS prefiere 204 en OPTIONS

})); // Middleware adicional para headers de seguridad compatible con iOS y túneles

app.use((req, res, next) => {
  // Detectar si la petición viene por HTTPS (del túnel)
  const protocol = req.headers['x-forwarded-proto'] || req.protocol; // Headers de seguridad solo si viene por HTTPS

  if (protocol === 'https') {
    // Strict-Transport-Security para iOS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  } // Headers adicionales para compatibilidad iOS


  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block'); // Cache-Control para iOS (evita problemas con caché agresivo)

  if (req.method === 'OPTIONS') {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  } // Log para debugging de túnel


  if (req.headers['x-forwarded-for']) {
    console.log(`[TUNNEL] Request from: ${req.headers['x-forwarded-for']} via ${protocol}`);
  }

  next();
}); // Aumentar límite de payload para iOS (puede enviar más datos)

app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb'
}));
app.use(express.json({
  limit: '10mb'
})); // Permite parsear JSON en las solicitudes
//=============================================================================================
//              Conexion a la BBDD utilizamos pool para gestionar las conexiones
//=============================================================================================
// Configuración de la base de datos utilizando un pool de conexiones

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "DreamsApp",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
}); // Manejo de eventos del pool

db.on('connection', connection => {
  console.log('[DB] Nueva conexión al pool establecida');
  connection.on('error', err => {
    console.error('[DB ERROR] Error en la conexión:', err.message);
    console.error('[DB ERROR] Código:', err.code);
  });
});
db.on('acquire', connection => {
  console.log('[DB] Conexión adquirida del pool');
});
db.on('release', connection => {
  console.log('[DB] Conexión liberada al pool');
});
db.on('error', err => {
  console.error('[DB POOL ERROR]', err.message);
}); // Verificar conexión al inicio

db.query('SELECT 1', err => {
  if (err) {
    console.error('[DB] Error al conectar con la base de datos:', err.message);
    console.error('[DB] Host:', process.env.DB_HOST || 'localhost');
    console.error('[DB] Database:', process.env.DB_NAME || 'DreamsApp');
  } else {
    console.log('[DB] Conexión a la base de datos establecida correctamente');
  }
}); // Función para manejar errores

const handleError = (res, err, message) => {
  console.error(err);
  res.status(500).json({
    error: message
  });
}; //=============================================================================================
//                            Conexion a la BBDD de los tickets
//=============================================================================================


const dbTickets = mysql.createPool({
  host: process.env.DB_TICKETS_HOST || "localhost",
  user: process.env.DB_TICKETS_USER || "root",
  password: process.env.DB_TICKETS_PASSWORD,
  database: process.env.DB_TICKETS_NAME || "TicketsDB",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
}); // Manejo de eventos para la conexión de tickets

dbTickets.on('connection', connection => {
  console.log('Nueva conexión al pool de tickets establecida');
  connection.on('error', err => {
    console.error('Error en la conexión de tickets:', err);
  });
}); //=============================================================================================
//                            Conexion a la BBDD de clientes
//=============================================================================================

const dbClientes = mysql.createPool({
  host: process.env.DB_CLIENTES_HOST || "localhost",
  user: process.env.DB_CLIENTES_USER || "root",
  password: process.env.DB_CLIENTES_PASSWORD,
  database: process.env.DB_CLIENTES_NAME || "clientes_dreams",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
}); // Manejo de eventos para la conexión de clientes

dbClientes.on('connection', connection => {
  console.log('[DB CLIENTES] Nueva conexión al pool de clientes establecida');
  connection.on('error', err => {
    console.error('[DB CLIENTES ERROR] Error en la conexión:', err);
  });
}); // Verificar conexión al inicio

dbClientes.query('SELECT 1', err => {
  if (err) {
    console.error('[DB CLIENTES] Error al conectar con la base de datos de clientes:', err.message);
    console.error('[DB CLIENTES] Host:', process.env.DB_CLIENTES_HOST || 'localhost');
    console.error('[DB CLIENTES] Database:', process.env.DB_CLIENTES_NAME || 'clientes_dreams');
  } else {
    console.log('[DB CLIENTES] Conexión a la base de datos de clientes establecida correctamente');
  }
}); //---------------------------------------------------------------------------------------------

app.post('/api/tickets', (req, res) => {
  const {
    pedidoId,
    detalles,
    total
  } = req.body;

  if (!pedidoId || !detalles || !total) {
    return res.status(400).json({
      error: "Todos los campos son obligatorios: pedidoId, detalles y total"
    });
  }

  const query = `INSERT INTO Tickets (pedidoId, detalles, total) VALUES (?, ?, ?)`;
  dbTickets.query(query, [pedidoId, detalles, total], (err, result) => {
    if (err) {
      console.error('Error al insertar el ticket:', err);
      return res.status(500).json({
        error: "Error al insertar el ticket"
      });
    }

    res.status(201).json({
      message: 'Ticket creado con éxito',
      ticketId: result.insertId
    });
  });
});
app.get('/api/tickets', (req, res) => {
  dbTickets.query(`SELECT * FROM Tickets`, (err, results) => {
    if (err) {
      console.error('Error al obtener los tickets:', err);
      return res.status(500).json({
        error: "Error al obtener los tickets"
      });
    } // Agregar depuración para ver el tipo de datos de 'detalles'


    results.forEach(ticket => {
      // Verificar si detalles es una cadena JSON
      if (typeof ticket.detalles === 'string') {
        try {
          ticket.detalles = JSON.parse(ticket.detalles); //console.log('Detalles después de JSON.parse():', ticket.detalles);
        } catch (parseError) {
          console.error('Error al parsear detalles:', parseError);
        }
      } else {
        console.log('Detalles ya es un objeto:', ticket.detalles);
      } // Asegurarse de que 'fecha' esté en el formato correcto


      if (ticket.fecha) {
        // Convertir la fecha a un formato adecuado
        ticket.fecha = new Date(ticket.fecha).toISOString(); // Convierte a formato ISO
      } else {
        console.error('Fecha es undefined o null');
      }
    });
    res.json(results); // Enviar respuesta al cliente
  });
}); //==============================================================================================
//                              Consultas a la BBDD
//==============================================================================================
// Health check endpoint

app.get("/api/health", (req, res) => {
  db.query('SELECT 1 as alive', (err, results) => {
    if (err) {
      console.error('[HEALTH] Base de datos NO disponible:', err.message);
      return res.status(500).json({
        status: 'error',
        database: 'disconnected',
        error: err.message
      });
    }

    console.log('[HEALTH] ✓ Sistema funcionando correctamente');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  });
}); // Ruta para obtener todos los datos de una tabla específica

app.get("/api/data/:table", (req, res) => {
  const {
    table
  } = req.params;
  console.log(`[API] GET /api/data/${table}`);
  db.query(`SELECT * FROM ??`, [table], (err, results) => {
    if (err) {
      console.error(`[API ERROR] Error al consultar ${table}:`, err.message);
      console.error('[API ERROR] Código:', err.code);
      res.status(500).json({
        error: "Error al ejecutar la consulta",
        details: err.message,
        code: err.code
      });
      return;
    }

    console.log(`[API] ✓ ${table}: ${results.length} registros`);
    res.json(results);
  });
}); // Ruta para obtener datos de la tabla promosheladeria donde activate es 1

app.get("/api/promosheladeria/active", (req, res) => {
  db.query(`SELECT * FROM PromosHeladeria WHERE Activo = 1`, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).json({
        error: "Error al ejecutar la consulta"
      });
      return;
    }

    res.json(results);
  });
}); // Ruta para obtener datos de la tabla PromosPuntos donde Activo es 1

app.get("/api/promospuntos/active", (req, res) => {
  console.log('[API] GET /api/promospuntos/active');
  db.query(`SELECT * FROM PromosPuntos WHERE Activo = 1`, (err, results) => {
    if (err) {
      console.error('[API ERROR] Error al consultar PromosPuntos:', err);
      res.status(500).json({
        error: "Error al ejecutar la consulta"
      });
      return;
    }

    console.log(`[API] ✓ PromosPuntos activas: ${results.length} registros`);
    res.json(results);
  });
}); // Ruta para obtener un dato específico por ID de una tabla específica

app.get("/api/data/:table/:id", (req, res) => {
  const {
    table,
    id
  } = req.params;
  db.query(`SELECT * FROM ?? WHERE id = ?`, [table, id], (err, results) => {
    if (err) {
      res.status(500).json({
        error: "Error al ejecutar la consulta"
      });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({
        error: "Dato no encontrado"
      });
      return;
    }

    res.json(results[0]);
  });
}); // Ruta para insertar datos en una tabla específica

app.post("/api/data/:table", (req, res) => {
  const {
    table
  } = req.params;
  const {
    name
  } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "El campo name es requerido"
    });
  }

  db.query(`INSERT INTO ?? (nombre) VALUES (?)`, [table, name], (err, result) => {
    if (err) {
      res.status(500).json({
        error: "Error al insertar datos"
      });
      return;
    }

    res.status(201).json({
      id: result.insertId,
      name
    });
  });
}); // Ruta para actualizar datos en una tabla específica

app.put("/api/data/:table/:id", (req, res) => {
  const {
    table,
    id
  } = req.params;
  const {
    name
  } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "El campo name es requerido"
    });
  }

  db.query(`UPDATE ?? SET nombre = ? WHERE id = ?`, [table, name, id], (err, result) => {
    if (err) {
      res.status(500).json({
        error: "Error al actualizar datos"
      });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({
        error: "Dato no encontrado"
      });
      return;
    }

    res.json({
      id,
      name
    });
  });
}); // Ruta para eliminar datos en una tabla específica

app.delete("/api/data/:table/:id", (req, res) => {
  const {
    table,
    id
  } = req.params;
  db.query(`DELETE FROM ?? WHERE id = ?`, [table, id], (err, result) => {
    if (err) {
      res.status(500).json({
        error: "Error al eliminar datos"
      });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({
        error: "Dato no encontrado"
      });
      return;
    }

    res.status(204).send();
  });
}); // Ruta para obtener complementos de una tabla específica

app.get("/api/complementos", (req, res) => {
  const {
    table
  } = req.query;

  if (!table) {
    return res.status(400).json({
      error: "El parámetro 'table' es requerido"
    });
  }

  let query = '';

  if (table === 'Cubatas') {
    query = 'SELECT * FROM Complementos_Cubata'; // Ajusta esto según tu esquema de base de datos
  } else if (table === 'Helados Personalizados') {
    query = 'SELECT * FROM Complementos_Helado'; // Ajusta esto según tu esquema de base de datos
  } else if (table === 'Cafes') {
    query = `SELECT * FROM Complementos_Cafe `;
  } else if (table === 'Bolleria') {
    query = `SELECT * FROM Complementos_Bolleria `;
  } else if (table === 'Ginebras') {
    query = `SELECT * FROM Complementos_Gins `;
  } else if (table === 'Infusiones') {
    query = `SELECT * FROM Complementos_Infusiones `;
  } else if (table === 'Batidos Helados') {
    query = `SELECT * FROM Complementos_Batidos `;
  } else if (table === 'Refrescos') {
    query = `SELECT * FROM Complementos_Refrescos `;
  } else if (table === 'Tostadas') {
    query = `SELECT * FROM Complementos_Tostadas `;
  }

  db.query(query, [table], (err, results) => {
    if (err) {
      res.status(500).json({
        error: "Error al ejecutar la consulta"
      });
      return;
    }

    res.json(results);
  });
});
app.get("/api/productos/:tableName/:productName/ncomplementos", (req, res) => {
  const {
    tableName,
    productName
  } = req.params; // Consulta SQL para obtener Ncomplementos de la tabla especificada

  const query = `SELECT Ncomplementos FROM ?? WHERE Nombre = ?`; // Ejecutar la consulta

  db.query(query, [tableName, productName], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).json({
        error: "Error al ejecutar la consulta"
      });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({
        error: "Producto no encontrado"
      });
      return;
    }

    res.json({
      Ncomplementos: results[0].Ncomplementos
    });
  });
}); // Ruta para insertar datos en una tabla específica

app.post('/api/write-to-file', (req, res) => {
  const {
    data
  } = req.body;
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const dateString = localDate.toISOString().split('T')[0]; // Obtener la fecha en formato YYYY-MM-DD

  const filename = `datos_${dateString}.txt`; // Nombre del archivo basado en la fecha

  const filePath = path.join(__dirname, 'files', filename); // Guardar en la carpeta 'files'
  // Incrementar el contador

  pedidoCounter++; // Agregar el contador al contenido del archivo

  const dataWithSeparator = `\n--------------------\nPedido #${pedidoCounter}: ${data}`;
  fs.appendFile(filePath, dataWithSeparator, err => {
    if (err) {
      console.error('Error al añadir datos al archivo:', err);
      return res.status(500).json({
        error: 'Error al añadir datos al archivo'
      });
    } //console.log('Datos añadidos al archivo:', filePath);


    res.json({
      message: 'Datos añadidos al archivo'
    });
  });
}); //-------------------------------------------------------------------------------------------------
//Control de mesas activas para evitar que se pueda abrir una mesa que ya esta abierta

let activeTables = [];
app.get('/api/active-tables', (req, res) => {
  res.json(activeTables);
});
app.post('/api/active-tables', (req, res) => {
  const {
    code
  } = req.body;

  if (!activeTables.includes(code)) {
    activeTables.push(code);
  }

  res.json(activeTables);
});
app.delete('/api/active-tables/:code', (req, res) => {
  const {
    code
  } = req.params;
  activeTables = activeTables.filter(table => table !== code);
  res.json(activeTables);
}); //-----------------------------------------------------------------------------------------------
//                              Página de administrador
//-----------------------------------------------------------------------------------------------
// Ruta para obtener los nombres de las tablas

app.get('/api/tables', (req, res) => {
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      res.status(500).json({
        error: 'Error al obtener las tablas'
      });
      return;
    }

    const tables = results.map(row => Object.values(row)[0]);
    res.json(tables);
  });
}); // Ruta para obtener datos de una tabla específica

app.get('/api/tables/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  db.query(`SELECT * FROM ??`, [tableName], (err, results) => {
    if (err) {
      res.status(500).json({
        error: 'Error al obtener los datos de la tabla'
      });
      return;
    }

    res.json(results);
  });
}); // Ruta para obtener las columnas de una tabla específica

app.get('/api/:tableName/columns', (req, res) => {
  const tableName = req.params.tableName;
  db.query(`SHOW COLUMNS FROM ??`, [tableName], (err, results) => {
    if (err) {
      res.status(500).json({
        error: 'Error al obtener las columnas de la tabla'
      });
      return;
    }

    const columns = results.map(row => row.Field);
    res.json(columns);
  });
}); // Ruta para editar datos en una tabla específica

app.put('/api/tables/:tableName/:id', (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  const updatedData = req.body;
  db.query(`UPDATE ?? SET ? WHERE id = ?`, [tableName, updatedData, id], (err, result) => {
    if (err) {
      res.status(500).json({
        error: 'Error al actualizar los datos'
      });
      return;
    }

    res.json({
      message: 'Datos actualizados correctamente'
    });
  });
});
app.post('/api/tables/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const newData = req.body; // Validar los datos recibidos

  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({
      error: 'Datos inválidos'
    });
  }

  db.query(`INSERT INTO ?? SET ?`, [tableName, newData], (err, result) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      return res.status(500).json({
        error: 'Error al agregar el producto'
      });
    }

    res.json({
      message: 'Producto agregado correctamente',
      id: result.insertId
    });
  });
});
app.delete('/api/tables/:tableName/:id', (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  db.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id], (err, result) => {
    if (err) {
      res.status(500).json({
        error: 'Error al borrar el producto'
      });
      return;
    }

    res.json({
      message: 'Producto borrado correctamente'
    });
  });
}); //=============================================================================================
//                    Proxy para el plugin de impresión (acceso local)
//=============================================================================================
// Endpoint proxy para el plugin de impresión

app.post('/api/printer-proxy', async (req, res) => {
  const {
    targetUrl,
    payload
  } = req.body;

  if (!targetUrl || !payload) {
    return res.status(400).json({
      error: 'Se requieren targetUrl y payload'
    });
  }

  console.log(`[PRINTER PROXY] POST ${targetUrl}`);

  try {
    const url = new URL(targetUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(payload))
      }
    };
    const proxyReq = protocol.request(options, proxyRes => {
      let data = '';
      proxyRes.on('data', chunk => {
        data += chunk;
      });
      proxyRes.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.status(proxyRes.statusCode).json(jsonData);
        } catch (e) {
          res.status(proxyRes.statusCode).send(data);
        }
      });
    });
    proxyReq.on('error', err => {
      console.error('[PRINTER PROXY ERROR]', err.message);
      res.status(500).json({
        error: 'Error al conectar con el plugin de impresión',
        message: err.message,
        target: targetUrl
      });
    });
    proxyReq.write(JSON.stringify(payload));
    proxyReq.end();
  } catch (error) {
    console.error('[PRINTER PROXY ERROR]', error);
    res.status(500).json({
      error: 'Error al procesar la solicitud de impresión',
      message: error.message
    });
  }
}); //=============================================================================================
//                     ENDPOINTS DE SESIONES DE CLIENTES Y BONIFICACIONES
//=============================================================================================
// Crear sesión de cliente registrado

app.post('/api/sesiones-clientes', async (req, res) => {
  const {
    cliente_id,
    mesa_code,
    sessionId
  } = req.body;

  if (!cliente_id || !mesa_code || !sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos'
    });
  }

  try {
    // Verificar si hay una sesión activa para esta mesa
    const [sesionesActivas] = await dbClientes.promise().query('SELECT * FROM sesiones_clientes WHERE mesa_code = ? AND activa = TRUE', [mesa_code]);

    if (sesionesActivas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Esta mesa ya tiene una sesión activa'
      });
    } // Crear nueva sesión


    const [result] = await dbClientes.promise().query('INSERT INTO sesiones_clientes (cliente_id, mesa_code, sessionId, activa) VALUES (?, ?, ?, TRUE)', [cliente_id, mesa_code, sessionId]);
    console.log('[SESION CLIENTE] Sesión creada para cliente:', cliente_id, 'mesa:', mesa_code);
    res.json({
      success: true,
      message: 'Sesión creada exitosamente',
      sesion_id: result.insertId
    });
  } catch (error) {
    console.error('[SESION CLIENTE ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sesión'
    });
  }
}); // Cerrar sesión de cliente

app.delete('/api/sesiones-clientes/:sessionId', async (req, res) => {
  const {
    sessionId
  } = req.params;

  try {
    await dbClientes.promise().query('UPDATE sesiones_clientes SET activa = FALSE WHERE sessionId = ?', [sessionId]);
    console.log('[SESION CLIENTE] Sesión cerrada:', sessionId);
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('[SESION CLIENTE ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión'
    });
  }
}); // Obtener sesión activa de un cliente

app.get('/api/sesiones-clientes/activa/:cliente_id', async (req, res) => {
  const {
    cliente_id
  } = req.params;

  try {
    const [sesiones] = await dbClientes.promise().query('SELECT * FROM sesiones_clientes WHERE cliente_id = ? AND activa = TRUE ORDER BY inicio_sesion DESC LIMIT 1', [cliente_id]);

    if (sesiones.length === 0) {
      return res.json({
        success: true,
        sesion: null
      });
    }

    res.json({
      success: true,
      sesion: sesiones[0]
    });
  } catch (error) {
    console.error('[SESION CLIENTE ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesión'
    });
  }
}); // Registrar bonificación (puntos por pedido)

app.post('/api/bonificaciones', async (req, res) => {
  const {
    cliente_id,
    mesa_code,
    total_ticket,
    detalles
  } = req.body;

  if (!cliente_id || !mesa_code || !total_ticket) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos requeridos'
    });
  }

  try {
    // Calcular puntos: 1 punto por cada euro gastado
    const puntos_acumulados = Math.floor(total_ticket); // Insertar bonificación

    const [result] = await dbClientes.promise().query('INSERT INTO bonificaciones (cliente_id, mesa_code, total_ticket, puntos_acumulados, detalles) VALUES (?, ?, ?, ?, ?)', [cliente_id, mesa_code, total_ticket, puntos_acumulados, detalles]);
    console.log('[BONIFICACION] Puntos añadidos:', puntos_acumulados, 'para cliente:', cliente_id);
    res.json({
      success: true,
      message: 'Bonificación registrada',
      bonificacion_id: result.insertId,
      puntos_ganados: puntos_acumulados
    });
  } catch (error) {
    console.error('[BONIFICACION ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar bonificación'
    });
  }
}); // Obtener puntos totales de un cliente

app.get('/api/bonificaciones/puntos/:cliente_id', async (req, res) => {
  const {
    cliente_id
  } = req.params;

  try {
    const [puntos] = await dbClientes.promise().query('SELECT * FROM vista_puntos_clientes WHERE id = ?', [cliente_id]);

    if (puntos.length === 0) {
      return res.json({
        success: true,
        puntos: {
          total_pedidos: 0,
          gasto_total: 0,
          puntos_totales: 0
        }
      });
    }

    res.json({
      success: true,
      puntos: puntos[0]
    });
  } catch (error) {
    console.error('[BONIFICACION ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntos'
    });
  }
}); // Obtener historial de bonificaciones de un cliente

app.get('/api/bonificaciones/historial/:cliente_id', async (req, res) => {
  const {
    cliente_id
  } = req.params;

  try {
    const [bonificaciones] = await dbClientes.promise().query('SELECT * FROM bonificaciones WHERE cliente_id = ? ORDER BY fecha_pedido DESC', [cliente_id]);
    res.json({
      success: true,
      bonificaciones: bonificaciones
    });
  } catch (error) {
    console.error('[BONIFICACION ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial'
    });
  }
}); //=============================================================================================
//                            ENDPOINTS DE CLIENTES
//=============================================================================================
// Función para generar alias único

function generarAlias(nombre) {
  const cleanName = nombre.toLowerCase().replace(/\s+/g, '').substring(0, 10);
  const randomNum = Math.floor(Math.random() * 9999);
  return `${cleanName}${randomNum}`;
} // Registrar nuevo cliente


app.post('/api/clientes/registro', async (req, res) => {
  const {
    nombre,
    alias,
    email,
    password,
    autorizacion
  } = req.body; // Validaciones

  if (!nombre || !alias || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios'
    });
  } // Validar formato del alias


  if (alias.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'El alias debe tener al menos 3 caracteres'
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(alias)) {
    return res.status(400).json({
      success: false,
      message: 'El alias solo puede contener letras, números y guiones bajos'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    });
  }

  try {
    // Verificar si el email ya existe
    const [existingUsers] = await dbClientes.promise().query('SELECT id FROM clientes WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este correo electrónico ya está registrado'
      });
    } // Verificar si el alias ya existe


    const [aliasCheck] = await dbClientes.promise().query('SELECT id FROM clientes WHERE alias = ?', [alias]);

    if (aliasCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este alias ya está en uso. Por favor, elige otro'
      });
    } // Hashear la contraseña antes de guardarla


    const hashedPassword = await bcrypt.hash(password, 10); // Insertar nuevo cliente

    const [result] = await dbClientes.promise().query('INSERT INTO clientes (nombre, email, alias, password, autorizacion, createdAt) VALUES (?, ?, ?, ?, ?, NOW())', [nombre, email, alias, hashedPassword, autorizacion ? 1 : 0]); // Obtener el cliente recién creado

    const [newClient] = await dbClientes.promise().query('SELECT id, nombre, email, alias, createdAt FROM clientes WHERE id = ?', [result.insertId]);
    console.log('[CLIENTES] Nuevo cliente registrado:', alias);
    res.json({
      success: true,
      message: 'Registro exitoso',
      cliente: newClient[0],
      alias: alias
    });
  } catch (error) {
    console.error('[CLIENTES ERROR] Error al registrar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el cliente'
    });
  }
}); // Verificar si un alias está disponible

app.get('/api/clientes/verificar-alias/:alias', async (req, res) => {
  const {
    alias
  } = req.params;

  try {
    const [results] = await dbClientes.promise().query('SELECT id FROM clientes WHERE alias = ?', [alias]);

    if (results.length > 0) {
      return res.json({
        exists: true,
        message: 'Este alias ya está en uso'
      });
    }

    res.json({
      exists: false,
      message: 'Alias disponible'
    });
  } catch (error) {
    console.error('[CLIENTES ERROR] Error al verificar alias:', error);
    res.status(500).json({
      exists: true,
      message: 'Error al verificar el alias'
    });
  }
}); // Login de cliente

app.post('/api/clientes/login', async (req, res) => {
  const {
    alias,
    password
  } = req.body; // Validaciones

  if (!alias || !password) {
    return res.status(400).json({
      success: false,
      message: 'Alias y contraseña son obligatorios'
    });
  }

  try {
    // Buscar cliente por alias
    const [clientes] = await dbClientes.promise().query('SELECT id, nombre, email, alias, password, createdAt FROM clientes WHERE alias = ?', [alias]);

    if (clientes.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Alias o contraseña incorrectos'
      });
    }

    const cliente = clientes[0]; // Verificar contraseña con bcrypt

    const isValidPassword = await bcrypt.compare(password, cliente.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Alias o contraseña incorrectos'
      });
    } // Remover password del objeto de respuesta


    delete cliente.password;
    console.log('[CLIENTES] Login exitoso:', alias);
    res.json({
      success: true,
      message: 'Login exitoso',
      cliente: cliente
    });
  } catch (error) {
    console.error('[CLIENTES ERROR] Error al hacer login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
}); // Obtener información de un cliente

app.get('/api/clientes/:id', async (req, res) => {
  const {
    id
  } = req.params;

  try {
    const [clientes] = await dbClientes.promise().query('SELECT id, nombre, email, alias, createdAt FROM clientes WHERE id = ?', [id]);

    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      cliente: clientes[0]
    });
  } catch (error) {
    console.error('[CLIENTES ERROR] Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del cliente'
    });
  }
}); // Verificar si un email existe

app.get('/api/clientes/verificar-email/:email', async (req, res) => {
  const {
    email
  } = req.params;

  try {
    const [clientes] = await dbClientes.promise().query('SELECT id FROM clientes WHERE email = ?', [email]);
    res.json({
      exists: clientes.length > 0
    });
  } catch (error) {
    console.error('[CLIENTES ERROR] Error al verificar email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar email'
    });
  }
}); //=============================================================================================
// Obtener la IP local del servidor

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Buscar IPv4 no interna
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return 'No disponible';
} // Iniciar servidor HTTP principal (Puerto 3000 - Compatible con tu APK)


const localIP = getLocalIP();
http.createServer(app).listen(httpPort, '0.0.0.0', () => {
  console.log(`===========================================`);
  console.log(`  API Server HTTP corriendo correctamente`);
  console.log(`===========================================`);
  console.log(`Puerto: ${httpPort}`);
  console.log(`API disponible en:`);
  console.log(`  - Localhost: http://localhost:${httpPort}/api`);
  console.log(`  - Red Local: http://${localIP}:${httpPort}/api`);

  if (process.env.DOMAIN) {
    console.log(`  - Público: http://${process.env.DOMAIN}:${httpPort}/api`);
  }

  console.log(`===========================================`);
  console.log(`📱 Compatible con APK actual`);
  console.log(`   App Config: http://pedidos.cafeteriadreams.com:3000/api`);
  console.log(`===========================================`);
}); // Servidor HTTPS opcional (solo si está habilitado y tiene certificados)

if (USE_HTTPS && sslOptions) {
  https.createServer(sslOptions, app).listen(httpsPort, '0.0.0.0', () => {
    console.log(`===========================================`);
    console.log(`  🔒 API Server HTTPS (Opcional)`);
    console.log(`===========================================`);
    console.log(`Puerto HTTPS: ${httpsPort}`);
    console.log(`Disponible en:`);
    console.log(`  - Localhost: https://localhost:${httpsPort}/api`);
    console.log(`  - Red Local: https://${localIP}:${httpsPort}/api`);

    if (process.env.DOMAIN) {
      console.log(`  - Público: https://${process.env.DOMAIN}:${httpsPort}/api`);
    }

    console.log(`===========================================`);
  });
}
//# sourceMappingURL=server.dev.js.map
