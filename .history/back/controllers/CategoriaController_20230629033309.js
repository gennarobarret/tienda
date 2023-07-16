"use strict";

const Categoria = require("../models/categoria");
const path = require("path");

const registro_categoria_admin = async function (req, res) {

    let data = req.body;
    let titulo_arr = [];
    const titulo = data.titulo.toLowerCase();
    titulo_arr = await titulo.find({ titulo: titulo });

    if (titulo_arr.length == 0) {
        if (req.user) {
            if (req.user.role == "admin") {
                if (data.oferta === "1") {
                    let portada_name = req.files.portada.path.split("\\").pop();
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
    } else {
        res.status(404).send({
            message: 'El titulo ya esta registrado.',
            data: undefined,
        });
    }

};

module.exports = {
    registro_categoria_admin,
};