"use strict";

var express = require("express");
var categoriaController = require("../controllers/CategoriaController");


var api = express.Router();
var auth = require("../middlewares/authenticate");
// var multiparty = require("connect-multiparty");
// var path = multiparty({ uploadDir: "./uploads/productos" });


//CATEGORIAS
api.post(
    "/registro_categoria_admin",
    [auth.auth],
    categoriaController.registro_categoria_admin
);
// api.get(
//     "/listar_categorias_admin/:filtro?",
//     auth.auth,
//     categoriaController.listar_categorias_admin
// );
// api.get(
//     "/obtener_categoria_admin/:id",
//     auth.auth,
//     categoriaController.obtener_categoria_admin
// );
// api.put(
//     "/actualizar_categoria_admin/:id",
//     [auth.auth, path],
//     categoriaController.actualizar_categoria_admin
// );
// api.delete(
//     "/eliminar_categoria_admin/:id",
//     auth.auth,
//     categoriaController.eliminar_categoria_admin
// );
