"use strict";

var Categoria = require("../models/categoria");


// REGISTRO DE CATEGORIA
const registro_categoria_admin = async function (req, res) {
    var data = req.body;
    var categoria_arr = [];
    const email = data.email.toLowerCase();
    categoria_arr = await Categoria.find({ email: email });

    if (categoria_arr.length == 0) {
        if (req.user) {
            if (req.user.role == "admin") {
                let reg = await Categoria.create(data);
                res.status(200).send({ data: reg });
            } else {
                res.status(500).send({ message: "NoAccess2" });
                console.log(req.user);
            }
        } else {
            res.status(500).send({ message: "NoAccess1" });
        }
    } else {
        res.status(404).send({
            message: 'El email ya esta registrado.',
            data: undefined,
        });
    }
};

module.exports = {
    registro_categoria_admin,
};