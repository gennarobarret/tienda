"use strict";

var Producto = require("../models/producto");


const registro_producto_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let data = req.body;

            var img_path = req.files.portada.path;
            var name = img_path.split("\\");
            var portada_name = name[2];

            data.slug = data.titulo
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
            data.portada = portada_name;
            let reg = await Producto.create(data);

            let inventario = await Inventario.create({
                admin: req.user.sub,
                cantidad: data.stock,
                proveedor: "Primer registro",
                producto: reg._id,
            });

            res.status(200).send({ data: reg, inventario: inventario });
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

module.exports = {
    registro_producto_admin,
};