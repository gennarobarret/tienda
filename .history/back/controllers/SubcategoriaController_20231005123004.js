"use strict";

const Subcategoria = require("../models/subcategoria");


// OBTENER CATEGORIA
const obtener_subcategoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let id = req.params["id"];

            try {
                let reg = await Subcategoria
                    .findById({ _id: id })
                    .populate('categoria') // Populate the 'categoria' field
                    .populate('ofertas');  // Populate the 'ofertas' field



                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ data: undefined });
            }
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

// LISTAR DE CATEGORIA
const listar_subcategorias_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let filtro = req.params["filtro"];

            try {
                let reg = await Subcategoria
                    .find({ nombre_subcategoria: new RegExp(filtro, "i") })
                    .populate('categoria') // Populate the 'categoria' field
                    .populate('ofertas');  // Populate the 'ofertas' field

                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: "Internal Server Error" });
            }
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
        const nombre_subcategoria = data.nombre_subcategoria.toLowerCase();
        subcategoria_arr = await Subcategoria.find({ nombre_subcategoria: { $regex: new RegExp('^' + nombre_subcategoria + '$', 'i') } });

        if (subcategoria_arr.length === 0) {
            if (req.user && req.user.role === "admin") {
                let reg = await Subcategoria.create(data);
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
const actualizar_subcategoria_admin = async function (req, res) {
    let subcategoria_arr = [];
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;

        const nombre_subcategoria = data.nombre_subcategoria.toLowerCase();
        subcategoria_arr = await Subcategoria.find({
            _id: { $ne: id },
            nombre_subcategoria: { $regex: new RegExp('^' + nombre_subcategoria + '$', 'i') }
        });

        if (subcategoria_arr.length === 0) {
            try {

                let reg = await Subcategoria.findByIdAndUpdate({ _id: id }, {
                    nombre_subcategoria: data.nombre_subcategoria,
                    estado_subcategoria: data.estado_subcategoria,

                });
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
const eliminar_subcategoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role === "admin") {
            const id = req.params["id"];
            const subcategoria = await Subcategoria.findByIdAndRemove({ _id: id });
            // console.log(subcategoria);
            if (subcategoria) {
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
