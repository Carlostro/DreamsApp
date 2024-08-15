const express = require("express");
const mysql = require("mysql2");
const app = express();
const cors = require("cors"); // Importar cors
const port = 3000;


// Configurar CORS
app.use(
  cors({
    //origin: 'http://localhost:8100' // Permitir solicitudes desde el puerto de Ionic
    origin: "http://192.168.1.41:4200",
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

// Ruta para obtener datos por nombre de una tabla específica

app.get("/api/data/:table", (req, res) => {
  const { table } = req.params;

  // Verificar que el parámetro no esté vacío
  if (!table) {
    res.status(400).json({ error: "Parámetro inválido" });
    return;
  }

  console.log(`Consultando todos los datos de la tabla: ${table}`);

  // Realizar la consulta a la base de datos
  db.query(`SELECT * FROM ??`, [table], (err, results) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).json({ error: "Error al ejecutar la consulta" });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: "Datos no encontrados" });
      return;
    }
    res.json(results);
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

// Ruta para imprimir contenido

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
