"use strict";

var express = require("express");

var mysql = require("mysql2");

var app = express();

var cors = require("cors"); // Importar cors


var port = 3000; // Configurar CORS

app.use(cors({
  //origin: 'http://localhost:8100' // Permitir solicitudes desde el puerto de Ionic
  origin: "http://192.168.1.41:4200"
}));
app.use(express.json()); // Permite parsear JSON en las solicitudes
// Configuración de la base de datos

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "DreamsApp"
}); // Conectar a la base de datos

db.connect(function (err) {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.stack);
    return;
  }

  console.log("Conectado a la base de datos MySQL.");
}); // Ruta para obtener todos los datos de una tabla específica

app.get("/api/data/:table", function (req, res) {
  var table = req.params.table;
  db.query("SELECT * FROM ??", [table], function (err, results) {
    if (err) {
      res.status(500).json({
        error: "Error al ejecutar la consulta"
      });
      return;
    }

    res.json(results);
  });
}); // Ruta para obtener un dato específico por ID de una tabla específica

app.get("/api/data/:table/:id", function (req, res) {
  var _req$params = req.params,
      table = _req$params.table,
      id = _req$params.id;
  db.query("SELECT * FROM ?? WHERE id = ?", [table, id], function (err, results) {
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
}); // Ruta para obtener datos por nombre de una tabla específica

app.get("/api/data/:table", function (req, res) {
  var table = req.params.table; // Verificar que el parámetro no esté vacío

  if (!table) {
    res.status(400).json({
      error: "Parámetro inválido"
    });
    return;
  }

  console.log("Consultando todos los datos de la tabla: ".concat(table)); // Realizar la consulta a la base de datos

  db.query("SELECT * FROM ??", [table], function (err, results) {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).json({
        error: "Error al ejecutar la consulta"
      });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({
        error: "Datos no encontrados"
      });
      return;
    }

    res.json(results);
  });
}); // Ruta para insertar datos en una tabla específica

app.post("/api/data/:table", function (req, res) {
  var table = req.params.table;
  var name = req.body.name;

  if (!name) {
    return res.status(400).json({
      error: "El campo name es requerido"
    });
  }

  db.query("INSERT INTO ?? (nombre) VALUES (?)", [table, name], function (err, result) {
    if (err) {
      res.status(500).json({
        error: "Error al insertar datos"
      });
      return;
    }

    res.status(201).json({
      id: result.insertId,
      name: name
    });
  });
}); // Ruta para actualizar datos en una tabla específica

app.put("/api/data/:table/:id", function (req, res) {
  var _req$params2 = req.params,
      table = _req$params2.table,
      id = _req$params2.id;
  var name = req.body.name;

  if (!name) {
    return res.status(400).json({
      error: "El campo name es requerido"
    });
  }

  db.query("UPDATE ?? SET nombre = ? WHERE id = ?", [table, name, id], function (err, result) {
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
      id: id,
      name: name
    });
  });
}); // Ruta para eliminar datos en una tabla específica

app["delete"]("/api/data/:table/:id", function (req, res) {
  var _req$params3 = req.params,
      table = _req$params3.table,
      id = _req$params3.id;
  db.query("DELETE FROM ?? WHERE id = ?", [table, id], function (err, result) {
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
}); // Ruta para imprimir contenido
// Iniciar el servidor

app.listen(port, function () {
  console.log("Servidor corriendo en http://localhost:".concat(port));
});
//# sourceMappingURL=server.dev.js.map
