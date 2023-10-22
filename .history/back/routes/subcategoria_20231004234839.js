"use strict";

let express = require("express");
let subcategoriaController = require("../controllers/SubcategoriaController");
let api = express.Router();
let auth = require("../middlewares/authenticate");

let path = multiparty({ uploadDir: "./uploads/subcategorias" });


//REGISTRO SUBCATEGORIAS
api.post(
    "/registro_subcategoria_admin",
    [auth.auth, path],
    subcategoriaController.registro_subcategoria_admin
);

//LISTAR SUBCATEGORIAS EN BASE A UN FILTRO
api.get(
    "/listar_subcategorias_admin/:filtro?",
    auth.auth,
    subcategoriaController.listar_subcategorias_admin
);


//OBTENER SUBCATEGORIAS POR ID
api.get(
    '/obtener_subcategoria_admin/:id',
    auth.auth,
    subcategoriaController.obtener_subcategoria_admin
);

//ACTUALIZAR ACTUALIZAR POR ID
api.put(
    "/actualizar_subcategoria_admin/:id",
    [auth.auth, path],
    subcategoriaController.actualizar_subcategoria_admin
);

//BORRAR ACTUALIZAR POR ID
api.delete(
    "/eliminar_subcategoria_admin/:id",
    auth.auth,
    subcategoriaController.eliminar_subcategoria_admin
);

module.exports = api;