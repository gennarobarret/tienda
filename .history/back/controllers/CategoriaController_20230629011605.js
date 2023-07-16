
"use strict";

const Categoria = require("../models/categoria");
const path = require("path");

const registro_categoria_admin = async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(500).send({ message: "NoAccess" });
    }

    let data = req.body;
    if (data.oferta === "1") {
        let img_path = req.files.portada.path;
        let portada_name = img_path.split("\")[2];
data.portada = portada_name;
    } else {
        data.descuento_oferta = 0;
    }

    let reg = await Categoria.create(data);
    res.status(200).send({ data: reg });
};

module.exports = { registro_categoria_admin };