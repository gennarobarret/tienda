"use strict";

var Producto = require("../models/producto");
var path = require("path");

const registro_producto_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let data = req.body;

            var img_path = req.files.portada.path;
            console.log(img_path);
            var name = img_path.split("\\");
            var portada_name = name[2];

            data.portada = portada_name;
            let reg = await Producto.create(data);

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