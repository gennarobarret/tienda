"use strict";

let express = require("express");
let subcategoriaController = require("../controllers/SubcategoriaController");

let api = express.Router();
let auth = require("../middlewares/authenticate");
let multiparty = require("connect-multiparty");
let path = multiparty({ uploadDir: "./uploads/subcategorias" });



//CATEGORIAS
api.post(
    "/registro_subcategoria_admin",
    [auth.auth, path],
    subcategoriaController.registro_subcategoria_admin
);

api.get(
    "/listar_subcategorias_admin/:filtro?",
    auth.auth,
    subcategoriaController.listar_subcategorias_admin
);

api.get(
    '/obtener_portada_subcategoria/:img',
    subcategoriaController.obtener_portada_subcategoria
);

api.get(
    '/obtener_subcategoria_admin/:id',
    auth.auth,
    subcategoriaController.obtener_subcategoria_admin
);

api.put(
    "/actualizar_subcategoria_admin/:id",
    [auth.auth, path],
    subcategoriaController.actualizar_subcategoria_admin
);

api.delete(
    "/eliminar_subcategoria_admin/:id",
    auth.auth,
    subcategoriaController.eliminar_subcategoria_admin
);

module.exports = api;