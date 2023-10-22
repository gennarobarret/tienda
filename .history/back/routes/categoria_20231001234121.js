"use strict";

let express = require("express");
let categoriaController = require("../controllers/CategoriaController");

let api = express.Router();
let auth = require("../middlewares/authenticate");
let multiparty = require("connect-multiparty");
let path = multiparty({ uploadDir: "./uploads/categorias" });



//CATEGORIAS
api.post(
    "/registro_categoria_admin",
    [auth.auth, path],
    categoriaController.registro_categoria_admin
);

api.get(
    "/listar_categorias_admin/:filtro?",
    auth.auth,
    categoriaController.listar_categorias_admin
);

// api.get(
//     '/obtener_portada_categoria/:img',
//     categoriaController.obtener_portada_categoria
// );

api.get(
    '/obtener_categoria_admin/:id',
    auth.auth,
    categoriaController.obtener_categoria_admin
);

api.put(
    "/actualizar_categoria_admin/:id",
    [auth.auth, path],
    categoriaController.actualizar_categoria_admin
);

api.delete(
    "/eliminar_categoria_admin/:id",
    auth.auth,
    categoriaController.eliminar_categoria_admin
);

module.exports = api;