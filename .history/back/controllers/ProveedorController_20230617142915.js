'use strict';

const Proveedor = require('../models/proveedor');
const { emit } = require("../models/proveedor");

//LISTAR DE PROVEEDOR
const listar_proveedores_filtro_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let tipo = req.params["tipo"];
            let filtro = req.params["filtro"];
            if (tipo == null || tipo == "null") {
                let reg = await Proveedor.find();
                res.status(200).send({ data: reg });
            } else {
                if (tipo == "company") {
                    let reg = await Proveedor.find({ company: new RegExp(filtro, "i") });
                    res.status(200).send({ data: reg });
                } else if (tipo == "correo") {
                    let reg = await Proveedor.find({ email: new RegExp(filtro, "i") });
                    res.status(200).send({ data: reg });
                }
            }
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

// REGISTRO DE PROVEEDOR
const registro_proveedor_admin = async function (req, res) {
    const data = req.body;
    const proveedor_arr = [];
    const email = data.email.toLowerCase();
    proveedor_arr = await Proveedor.find({ email: email });

    if (proveedor_arr.length == 0) {
        if (req.user) {
            if (req.user.role == "admin") {
                let reg = await Proveedor.create(data);
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

//OBTENER PROVEEDOR
const obtener_proveedor_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            var id = req.params["id"];

            try {
                var reg = await Proveedor.findById({ _id: id });

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
//UPDATE PROVEEDOR
const actualizar_proveedor_admin = async function (req, res) {
    //Si no existe un usuario y si no es admin
    if (!req.user || req.user.role !== 'admin') {
        return res.status(400).send({ status: 'error', message: 'No puedes realizar esta accion.' });
    }
    const id = req.params['id'];
    const params = req.body;
    try {
        //Buscar si existe el proveedor
        Proveedor.findById(id).exec((err, data) => {
            if (err || !data) {
                return res.status(404).send({ status: 'error', message: 'No se ha encontrado el proveedor.' });
            }
            //Si existe el proveedor, buscar que el email sea unico o que sea el mismo (No se actualizo)
            Proveedor.findOne({ email: params.email.toLowerCase() }, (err, data) => {
                if (err) {
                    return res.status(500).send({ message: 'Error al intentar actualizar datos' });
                }
                if (data && data.email == params.email.toLowerCase() && data._id != id) {
                    return res.status(400).send({ message: 'El email ya esta registrado.' });
                } else {
                    //Si el email es unico o es el mismo, actualizar el proveedor
                    Proveedor.findByIdAndUpdate({ _id: id },
                        params, { new: true }, (err, data) => {
                            if (err || !data) {
                                return res.status(500).send({ status: 'error', message: "Error al actualizar usuario" });
                            }
                            //Devolver respuesta
                            return res.status(200).send({ status: 'success', message: 'Usuario actualizado', data: data });
                        });
                }
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Ha ocurrido un error, intenta de nuevo'
        })
    }
};

//DELETE PROVEEDOR
const eliminar_proveedor_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            var id = req.params["id"];
            var reg = await Proveedor.findByIdAndRemove({ _id: id });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

module.exports = {
    listar_proveedores_filtro_admin,
    registro_proveedor_admin,
    obtener_proveedor_admin,
    actualizar_proveedor_admin,
    eliminar_proveedor_admin,
};