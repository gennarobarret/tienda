"use strict";

let express = require("express");
let ofertaController = require("../controllers/OfertaController");

let api = express.Router();
let auth = require("../middlewares/authenticate");
let multiparty = require("connect-multiparty");
let path = multiparty({ uploadDir: "./uploads/ofertas" });



//CATEGORIAS
api.post(
    "/registro_oferta_admin",
    [auth.auth, path],
    ofertaController.registro_oferta_admin
);

api.get(
    "/listar_ofertas_admin/:filtro?",
    auth.auth,
    ofertaController.listar_ofertas_admin
);

api.get(
    '/obtener_portada_oferta/:img',
    ofertaController.obtener_portada_oferta
);

api.get(
    '/obtener_oferta_admin/:id',
    auth.auth,
    ofertaController.obtener_oferta_admin
);

api.put(
    "/actualizar_oferta_admin/:id",
    [auth.auth, path],
    ofertaController.actualizar_oferta_admin
);

api.delete(
    "/eliminar_oferta_admin/:id",
    auth.auth,
    ofertaController.eliminar_oferta_admin
);

module.exports = api;