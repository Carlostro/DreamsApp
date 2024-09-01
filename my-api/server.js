const express = require("express");
const mysql = require("mysql2");
const app = express();
const cors = require("cors");
const port = 3000;

// Habilitar CORS
app.use(
  cors({
     origin: 'http://localhost:8100'
   // origin: "http://192.168.1.41:4200",
  })
);

app.use(express.json()); // Permite parsear JSON en las solicitudes

// Configuración de la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "DreamsApp",
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.stack);
    return;
  }
  console.log("Conectado a la base de datos MySQL.");
});

// Ruta para obtener todos los datos de una tabla específica
app.get("/api/data/:table", (req, res) => {
  const { table } = req.params;
  db.query(`SELECT * FROM ??`, [table], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error al ejecutar la consulta" });
      return;
    }
    res.json(results);
  });
});

// Ruta para obtener datos de la tabla promosheladeria donde activate es 1
app.get("/api/promosheladeria/active", (req,res) => {
  db.query(`SELECT * FROM PromosHeladeria WHERE Activo = 1`, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).json({ error: "Error al ejecutar la consulta" });
      return;
    }
    res.json(results);
  });
});

// Ruta para obtener un dato específico por ID de una tabla específica
app.get("/api/data/:table/:id", (req, res) => {
  const { table, id } = req.params;
  db.query(`SELECT * FROM ?? WHERE id = ?`, [table, id], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error al ejecutar la consulta" });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: "Dato no encontrado" });
      return;
    }
    res.json(results[0]);
  });
});

// Ruta para insertar datos en una tabla específica
app.post("/api/data/:table", (req, res) => {
  const { table } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "El campo name es requerido" });
  }

  db.query(
    `INSERT INTO ?? (nombre) VALUES (?)`,
    [table, name],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Error al insertar datos" });
        return;
      }
      res.status(201).json({ id: result.insertId, name });
    }
  );
});

// Ruta para actualizar datos en una tabla específica
app.put("/api/data/:table/:id", (req, res) => {
  const { table, id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "El campo name es requerido" });
  }

  db.query(
    `UPDATE ?? SET nombre = ? WHERE id = ?`,
    [table, name, id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Error al actualizar datos" });
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).json({ error: "Dato no encontrado" });
        return;
      }
      res.json({ id, name });
    }
  );
});

// Ruta para eliminar datos en una tabla específica
app.delete("/api/data/:table/:id", (req, res) => {
  const { table, id } = req.params;
  db.query(`DELETE FROM ?? WHERE id = ?`, [table, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error al eliminar datos" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Dato no encontrado" });
      return;
    }
    res.status(204).send();
  });
});

// Ruta para obtener complementos de una tabla específica
app.get("/api/complementos", (req, res) => {
  const { table } = req.query;
  if (!table) {
    return res.status(400).json({ error: "El parámetro 'table' es requerido" });
  }

  let query = '';
  if (table === 'Cubatas') {
    query = 'SELECT * FROM Complementos_Cubata'; // Ajusta esto según tu esquema de base de datos
  } else if (table === 'Helados Personalizados') {
    query = 'SELECT * FROM Complementos_Helado'; // Ajusta esto según tu esquema de base de datos
  } else if (table === 'Cafes') {
    query = `SELECT Nombre,Precio FROM Complementos_Cafe `;
  } else if (table === 'Bolleria') {
    query = `SELECT Nombre,Precio FROM Complementos_Bolleria `;
  } else if (table === 'Ginebras') {
    query = `SELECT * FROM Complementos_Gins `;
  } else if (table === 'Infusiones') {
    query = `SELECT * FROM Complementos_Infusiones `;
  }
  db.query(query, [table], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error al ejecutar la consulta" });
      return;
    }
    res.json(results);
  });
});

app.get("/api/productos/:tableName/:productName/ncomplementos", (req, res) => {
  const { tableName, productName } = req.params;

  // Consulta SQL para obtener Ncomplementos de la tabla especificada
  const query = `SELECT Ncomplementos FROM ?? WHERE Nombre = ?`;

  // Ejecutar la consulta
  db.query(query, [tableName, productName], (err, results) => {
      if (err) {
          console.error('Error al ejecutar la consulta:', err);
          res.status(500).json({ error: "Error al ejecutar la consulta" });
          return;
      }
      if (results.length === 0) {
          res.status(404).json({ error: "Producto no encontrado" });
          return;
      }
      res.json({ Ncomplementos: results[0].Ncomplementos });
  });
});






// Página de administrador

// Ruta para obtener los nombres de las tablas
app.get('/api/tables', (req, res) => {
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener las tablas' });
      return;
    }
    const tables = results.map(row => Object.values(row)[0]);
    res.json(tables);
  });
});

// Ruta para obtener datos de una tabla específica
app.get('/api/tables/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  db.query(`SELECT * FROM ??`, [tableName], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener los datos de la tabla' });
      return;
    }
    res.json(results);
  });
});

// Ruta para editar datos en una tabla específica
app.put('/api/tables/:tableName/:id', (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  const updatedData = req.body;

  db.query(`UPDATE ?? SET ? WHERE id = ?`, [tableName, updatedData, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error al actualizar los datos' });
      return;
    }
    res.json({ message: 'Datos actualizados correctamente' });
  });
});
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
