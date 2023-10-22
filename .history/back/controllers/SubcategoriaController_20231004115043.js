"use strict";

const Subcategoria = require("../models/subcategoria");
const fs = require("fs");
const path = require("path");

//OBTENER CATEGORIA
const obtener_subcategoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let id = req.params["id"];

            try {
                let reg = await Subcategoria.findById({ _id: id });

                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

//LISTAR DE CATEGORIA
const listar_subcategorias_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let filtro = req.params["filtro"];
            let reg = await Subcategoria.find({ titulo: new RegExp(filtro, "i") });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

// REGISTRO DE CATEGORIA
const registro_subcategoria_admin = async function (req, res) {
    try {
        let data = req.body;

        let subcategoria_arr = [];
        const titulo = data.titulo.toLowerCase();
        subcategoria_arr = await Subcategoria.find({ titulo: { $regex: new RegExp('^' + titulo + '$', 'i') } });

        if (subcategoria_arr.length === 0) {
            if (req.user && req.user.role === "admin") {

                // if (data.estado == 'true') {
                //     // if (req.files && req.files.portada) {
                //     //     let portada_name = req.files.portada.path.split("\\").pop();
                //     //     data.portada = portada_name;
                //     // } else {
                let reg = await Subcategoria.create(data);
                res.status(200).send({ data: reg });


            } else {
                res.status(403).send({ message: "NoAccess" });
            }
        } else {
            res.status(409).send({
                message: 'Ya existe una subcategoría con el mismo título.',
                data: undefined,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

// ACTUALIZAR DE CATEGORIA
const actualizar_subcategoria_admin = async function (req, res) {
    let subcategoria_arr = [];
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        const titulo = data.titulo.toLowerCase();
        subcategoria_arr = await Subcategoria.find({
            _id: { $ne: id },
            titulo: { $regex: new RegExp('^' + titulo + '$', 'i') }
        });

        if (subcategoria_arr.length === 0) {
            try {
                if (req.files && req.files.portada) {


                } else {
                    let reg = await Subcategoria.findByIdAndUpdate({ _id: id }, {
                        titulo: data.titulo,
                        icono: data.icono,
                        estado: data.estado,
                    });
                    res.status(200).send({ data: reg });
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        } else {
            res.status(409).send({
                message: 'Ya existe una subcategoría con el mismo título.',
                data: undefined,
            });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

// ELIMINAR CATEGORIA
const eliminar_subcategoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role === "admin") {
            const id = req.params["id"];
            const subcategoria = await Subcategoria.findByIdAndRemove({ _id: id });
            // console.log(subcategoria);
            if (subcategoria) {
                const imageName = subcategoria.portada;
                res.status(200).send({ message: "Categoría eliminada exitosamente" });
            } else {
                res.status(404).send({ message: "Categoría no encontrada" });
            }
        } else {
            res.status(403).send({ message: "Acceso denegado" });
        }
    } else {
        res.status(403).send({ message: "Acceso denegado" });
    }
};

module.exports = {
    registro_subcategoria_admin,
    listar_subcategorias_admin,
    obtener_subcategoria_admin,
    actualizar_subcategoria_admin,
    eliminar_subcategoria_admin,
};
