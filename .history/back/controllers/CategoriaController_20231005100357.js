"use strict";

const Categoria = require("../models/categoria");
const fs = require("fs");
const path = require("path");

//OBTENER CATEGORIA
const obtener_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let id = req.params["id"];

            try {
                let reg = await Categoria.findById({ _id: id });

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
const listar_categorias_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let filtro = req.params["filtro"];
            let reg = await Categoria.find({ nombre_categoria: new RegExp(filtro, "i") });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};


// REGISTRO DE CATEGORIA
const registro_categoria_admin = async function (req, res) {
    try {
        let data = req.body;

        let categoria_arr = [];
        const nombre_categoria = data.nombre_categoria.toLowerCase();
        categoria_arr = await Categoria.find({ nombre_categoria: { $regex: new RegExp('^' + nombre_categoria + '$', 'i') } });

        if (categoria_arr.length === 0) {
            if (req.user && req.user.role === "admin") {
                let reg = await Categoria.create(data);
                res.status(200).send({ data: reg });


            } else {
                res.status(403).send({ message: "NoAccess" });
            }
        } else {
            res.status(409).send({
                message: 'Ya existe una categoría con el mismo título.',
                data: undefined,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

// ACTUALIZAR DE CATEGORIA
const actualizar_categoria_admin = async function (req, res) {
    let categoria_arr = [];
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        const nombre_categoria = data.nombre_categoria.toLowerCase();
        categoria_arr = await Categoria.find({
            _id: { $ne: id },
            nombre_categoria: { $regex: new RegExp('^' + nombre_categoria + '$', 'i') }
        });

        if (categoria_arr.length === 0) {
            try {
                if (req.files && req.files.portada) {

                    let reg = await Categoria.findByIdAndUpdate({ _id: id }, {
                        nombre_categoria: data.nombre_categoria,
                        icono_categoria: data.icono_categoria,
                        estado_categoria: data.estado_categoria,
                        // oferta: data.oferta,
                        // descuento_oferta: data.descuento_oferta,
                        // fin_oferta: data.fin_oferta
                    });
                }
                res.status(200).send({ data: reg });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        } else {
            res.status(409).send({
                message: 'Ya existe una categoría con el mismo título.',
                data: undefined,
            });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

// ELIMINAR CATEGORIA
const eliminar_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role === "admin") {
            const id = req.params["id"];
            const categoria = await Categoria.findByIdAndRemove({ _id: id });
            // console.log(categoria);
            if (categoria) {
                const imageName = categoria.portada;
                if (imageName) {
                    fs.unlink('./uploads/categorias/' + imageName, (err) => {
                        // if (err) {
                        //     res.status(500).send({ message: "Error al eliminar la imagen" });
                        // } else {
                        res.status(200).send({ message: "Imagen eliminada y categoría eliminada exitosamente" });
                        // }
                    });
                } else {
                    // No imageName, proceed with category deletion
                    res.status(200).send({ message: "Categoría eliminada exitosamente" });
                }
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
    registro_categoria_admin,
    listar_categorias_admin,
    // obtener_portada_categoria,
    obtener_categoria_admin,
    actualizar_categoria_admin,
    eliminar_categoria_admin,
};
