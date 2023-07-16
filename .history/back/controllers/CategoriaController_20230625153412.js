"use strict";

var Categoria = require("../models/categoria");
var fs = require("fs");
var path = require("path");



// REGISTRO DE CATEGORIA
const registro_categoria_admin = async function (req, res) {
    let data = req.body;
    var categoria_arr = [];
    var titulo = data.titulo.toLowerCase();
    categoria_arr = await Categoria.find({ titulo: titulo });

    if (categoria_arr.length == 0) {
        if (req.user) {
            if (req.user.role == "admin") {

                var img_path = req.files.portada.path;
                var name = img_path.split("\\");
                var portada_name = name[2];
                data.portada = portada_name;

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
            message: 'El titulo ya esta registrado.',
            data: undefined,
        });
    }
};

module.exports = {
    registro_categoria_admin,
};