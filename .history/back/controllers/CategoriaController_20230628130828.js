"use strict";

var Categoria = require("../models/categoria");
var path = require("path");

const registro_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let data = req.body;

            if (typeof req.files.portada !== 'undefined') {
                var img_path = req.files.portada.path;
                console.log(img_path);
                var name = img_path.split("\\");
                var portada_name = name[2];
                data.portada = portada_name;
            }

            // Validate and convert the "descuento_oferta" field
            if (typeof req.body.descuento_oferta !== 'undefined') {
                const descuentoOferta = Number(req.body.descuento_oferta);
                if (!isNaN(descuentoOferta)) {
                    data.descuento_oferta = descuentoOferta;
                }
            }

            // Check if the "descuento_oferta" field is present and valid
            if (typeof data.descuento_oferta === 'undefined') {
                // Handle the case when the field is missing or invalid
                res.status(400).send({ message: "Invalid descuento_oferta value" });
                return;
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
