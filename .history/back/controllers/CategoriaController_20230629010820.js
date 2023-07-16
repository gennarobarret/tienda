"use strict";

var Categoria = require("../models/categoria");
var path = require("path");

const registro_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let data = req.body;
            if (data.oferta == "1") {
                var img_path = req.files.portada.path;
                var name = img_path.split("\\");
                var portada_name = name[2];
                data.portada = portada_name;
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