"use strict";

const Categoria = require("../models/categoria");
var path = require("path");

const registro_categoria_admin = async function (req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            throw new Error("NoAccess");
        }

        const { oferta, portada, ...data } = req.body;

        if (oferta === "1") {
            const portada_name = req.files.portada.path.split("\\")[2];
            data.portada = portada_name;
        } else {
            data.descuento_oferta = 0;
        }

        const reg = await Categoria.create(data);

        res.status(200).send({ data: reg });
    } catch (error) {
        res.status(500).send({ message: error.message || "NoAccess" });
    }
};

module.exports = {
    registro_categoria_admin,
};
