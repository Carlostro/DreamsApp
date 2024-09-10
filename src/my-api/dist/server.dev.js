"use strict";

var express = require("express");

var fs = require('fs');

var bodyParser = require('body-parser');

var path = require('path');

var mysql = require("mysql2");

var app = express();

var cors = require("cors");

var port = 3000; // Habilitar CORS

app.use(cors({
  origin: ['http://localhost:8100', "http://192.168.1.44:4200"]
}));
app.use(bodyParser.json());
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
}); // Ruta para obtener datos de la tabla promosheladeria donde activate es 1

app.get("/api/promosheladeria/active", function (req, res) {
  db.query("SELECT * FROM PromosHeladeria WHERE Activo = 1", function (err, results) {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
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
}); // Ruta para obtener complementos de una tabla específica

app.get("/api/complementos", function (req, res) {
  var table = req.query.table;

  if (!table) {
    return res.status(400).json({
      error: "El parámetro 'table' es requerido"
    });
  }

  var query = '';

  if (table === 'Cubatas') {
    query = 'SELECT * FROM Complementos_Cubata'; // Ajusta esto según tu esquema de base de datos
  } else if (table === 'Helados Personalizados') {
    query = 'SELECT * FROM Complementos_Helado'; // Ajusta esto según tu esquema de base de datos
  } else if (table === 'Cafes') {
    query = "SELECT * FROM Complementos_Cafe ";
  } else if (table === 'Bolleria') {
    query = "SELECT * FROM Complementos_Bolleria ";
  } else if (table === 'Ginebras') {
    query = "SELECT * FROM Complementos_Gins ";
  } else if (table === 'Infusiones') {
    query = "SELECT * FROM Complementos_Infusiones ";
  } else if (table === 'Batidos Helados') {
    query = "SELECT * FROM Complementos_Batidos ";
  }

  db.query(query, [table], function (err, results) {
    if (err) {
      res.status(500).json({
        error: "Error al ejecutar la consulta"
      });
      return;
    }

    res.json(results);
  });
});
app.get("/api/productos/:tableName/:productName/ncomplementos", function (req, res) {
  var _req$params4 = req.params,
      tableName = _req$params4.tableName,
      productName = _req$params4.productName; // Consulta SQL para obtener Ncomplementos de la tabla especificada

  var query = "SELECT Ncomplementos FROM ?? WHERE Nombre = ?"; // Ejecutar la consulta

  db.query(query, [tableName, productName], function (err, results) {
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

app.post('/api/write-to-file', function (req, res) {
  var data = req.body.data;
  var date = new Date();
  var localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  var dateString = localDate.toISOString().split('T')[0]; // Obtener la fecha en formato YYYY-MM-DD

  var filename = "datos_".concat(dateString, ".txt"); // Nombre del archivo basado en la fecha

  var filePath = path.join(__dirname, 'files', filename); // Guardar en la carpeta 'files'

  var dataWithSeparator = "\n--------------------\n".concat(data);
  fs.appendFile(filePath, dataWithSeparator, function (err) {
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

var activeTables = [];
app.get('/active-tables', function (req, res) {
  res.json(activeTables);
});
app.post('/active-tables', function (req, res) {
  var code = req.body.code;

  if (!activeTables.includes(code)) {
    activeTables.push(code);
  }

  res.json(activeTables);
});
app["delete"]('/active-tables/:code', function (req, res) {
  var code = req.params.code;
  activeTables = activeTables.filter(function (table) {
    return table !== code;
  });
  res.json(activeTables);
}); //-----------------------------------------------------------------------------------------------
//                              Página de administrador
//-----------------------------------------------------------------------------------------------
// Ruta para obtener los nombres de las tablas

app.get('/api/tables', function (req, res) {
  db.query('SHOW TABLES', function (err, results) {
    if (err) {
      res.status(500).json({
        error: 'Error al obtener las tablas'
      });
      return;
    }

    var tables = results.map(function (row) {
      return Object.values(row)[0];
    });
    res.json(tables);
  });
}); // Ruta para obtener datos de una tabla específica

app.get('/api/tables/:tableName', function (req, res) {
  var tableName = req.params.tableName;
  db.query("SELECT * FROM ??", [tableName], function (err, results) {
    if (err) {
      res.status(500).json({
        error: 'Error al obtener los datos de la tabla'
      });
      return;
    }

    res.json(results);
  });
}); // Ruta para editar datos en una tabla específica

app.put('/api/tables/:tableName/:id', function (req, res) {
  var tableName = req.params.tableName;
  var id = req.params.id;
  var updatedData = req.body;
  db.query("UPDATE ?? SET ? WHERE id = ?", [tableName, updatedData, id], function (err, result) {
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
}); // Iniciar el servidor

app.listen(port, function () {
  console.log("Servidor corriendo Correctamente");
});
//# sourceMappingURL=server.dev.js.map
