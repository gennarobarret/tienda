'use strict';

var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var port = process.env.PORT || 4201;

var admin_route = require('./routes/admin');
var cliente_route = require('./routes/cliente');
var producto_route = require('./routes/producto');
var proveedor_route = require('./routes/proveedor');
var categoria_route = require('./routes/categoria');
// var oferta_route = require('./routes/oferta');
// var subcategoria_route = require('./routes/subcategoria');


mongoose.connect(
  'mongodb://127.0.0.1:27017/tienda',
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err, res) => {
    if (err) {
      console.log(err);
    } else {
      app.listen(port, function () {
        console.log('******* Servidor en línea en el puerto ' + port + " *******");
      });
    }
  }
);

//PARSEA EN JSON LOS OBJETOS ENVIADOS
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({ limit: '50mb', extended: true }));

//PERMISOS CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method'
  );
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Allow', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

//INICIALIZA LAS RUTAS
app.use('/api', cliente_route);
app.use('/api', admin_route);
app.use('/api', producto_route);
app.use('/api', proveedor_route);
app.use('/api', categoria_route);
// app.use('/api', oferta_route);
// app.use('/api', subcategoria_route);

module.exports = app;
