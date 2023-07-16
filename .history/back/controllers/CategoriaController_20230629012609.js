"use strict";

const Categoria = require("../models/categoria");
const path = require("path");

const registro_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let data = req.body;
            if (data.oferta == "1") {
                let img_path = req.files.portada.path;
                let name = img_path.split("\\");
                let portada_name = name[2];
                data.portada = portada_name;
            } else {
                data.descuento_oferta = 0;
            }
            let reg = await Categoria.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

module.exports = {
    registro_categoria_admin,
};