"use strict";

const Categoria = require("../models/categoria");
const Subcategoria = require("../models/subcategoria");

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
            if (categoria) {
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
    registro_categoria_admin,
    listar_categorias_admin,
    obtener_categoria_admin,
    actualizar_categoria_admin,
    eliminar_categoria_admin,
};
