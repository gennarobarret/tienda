"use strict";

const Oferta = require("../models/oferta");
const fs = require("fs");
const path = require("path");

//OBTENER CATEGORIA
const obtener_oferta_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let id = req.params["id"];

            try {
                let reg = await Oferta.findById({ _id: id });

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
const listar_ofertas_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let filtro = req.params["filtro"];
            let reg = await Oferta.find({ nombre_oferta: new RegExp(filtro, "i") });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

//OBTENER PORTADA CATEGORIA
const obtener_portada_oferta = async function (req, res) {
    let img = req.params["img"];
    fs.stat("./uploads/ofertas/" + img, function (err) {
        if (!err) {
            let path_img = "./uploads/ofertas/" + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = "./uploads/default.jpg";
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
};

// REGISTRO DE CATEGORIA
const registro_oferta_admin = async function (req, res) {
    try {
        let data = req.body;
        let oferta_arr = [];
        const nombre_oferta = data.nombre_oferta.toLowerCase();
        oferta_arr = await Oferta.find({ nombre_oferta: { $regex: new RegExp('^' + nombre_oferta + '$', 'i') } });
        if (oferta_arr.length === 0) {
            if (!req.user) {
                return res.status(401).send({ message: "Acceso denegado" });
            }
            if (req.user.role !== "admin") {
                return res.status(403).send({ message: "Desautorizado" });
            }
            if (typeof data.estado_oferta === 'undefined') {
                // If data.estado_oferta is undefined, set it to true.
                data.estado_oferta = true;
            } else if (data.estado_oferta === 'true') {
                // Convert 'true' string to a boolean true.
                data.estado_oferta = true;
            } else {
                // If it's anything else, set it to false.
                data.estado_oferta = false;
            }
            if (data.estado_oferta) {
                if (req.files && req.files.portada_oferta) {
                    let portada_oferta_name = req.files.portada_oferta.path.split("\\").pop();
                    console.log(portada_oferta_name);
                    data.portada_oferta = portada_oferta_name;
                } else {
                    // Set the 'portada' field to null if no file is provided.
                    data.portada_oferta = null;
                }
            } else {
                data.fin_oferta = new Date("2000-01-01T00:00:00.000Z");
                // Ensure that the 'descuento_oferta' field is a valid number
                if (typeof data.descuento_oferta !== 'undefined') {
                    data.descuento_oferta = parseFloat(data.descuento_oferta);
                    if (isNaN(data.descuento_oferta)) {
                        // If it's not a valid number, set it to zero.
                        data.descuento_oferta = 0;
                    }
                } else {
                    // If the value is undefined, set it to zero as the default.
                    data.descuento_oferta = 0;
                }
            }

            let reg = await Oferta.create(data);
            res.status(200).send({ data: reg });
        } else {
            res.status(409).send({
                message: 'Ya existe una oferta con el mismo título.',
                data: undefined,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

// ACTUALIZAR DE CATEGORIA
const actualizar_oferta_admin = async function (req, res) {
    let oferta_arr = [];
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        console.log(data);
        const nombre_oferta = data.nombre_oferta.toLowerCase();
        oferta_arr = await Oferta.find({
            _id: { $ne: id },
            nombre_oferta: { $regex: new RegExp('^' + nombre_oferta + '$', 'i') }
        });

        if (oferta_arr.length === 0) {
            try {
                if (req.files && req.files.portada_oferta) {
                    let img_path = req.files.portada_oferta.path;
                    let name = img_path.split('\\');
                    let portada_oferta_name = name[2];
                    const existingOffer = await Oferta.findById(id);
                    if (existingOffer && existingOffer.portada_oferta) {
                        const existingPortadaOfferPath = `uploads/ofertas/${existingOffer.portada_oferta}`;
                        if (fs.existsSync(existingPortadaOfferPath)) {
                            fs.unlinkSync(existingPortadaOfferPath);
                        }
                    }
                    let reg = await Oferta.findByIdAndUpdate({ _id: id }, {
                        nombre_oferta: data.nombre_oferta,
                        descripcion_oferta: data.descripcion_oferta,
                        estado_oferta: data.estado_oferta,
                        descuento_oferta: data.descuento_oferta,
                        inicio_oferta: data.inicio_oferta,
                        fin_oferta: data.fin_oferta,
                        portada_oferta: portada_oferta_name
                    });
                    res.status(200).send({ data: reg });

                } else {
                    let reg = await Oferta.findByIdAndUpdate({ _id: id }, {
                        nombre_oferta: data.nombre_oferta,
                        descripcion_oferta: data.descripcion_oferta,
                        estado_oferta: data.estado_oferta,
                        descuento_oferta: data.descuento_oferta,
                        inicio_oferta: data.inicio_oferta,
                        fin_oferta: data.fin_oferta,
                        fin_oferta: data.fin_oferta
                    });
                    res.status(200).send({ data: reg });
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        } else {
            res.status(409).send({
                message: 'Ya existe una oferta con el mismo título.',
                data: undefined,
            });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

// ELIMINAR CATEGORIA
const eliminar_oferta_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role === "admin") {
            const id = req.params["id"];
            const oferta = await Oferta.findByIdAndRemove({ _id: id });
            // console.log(oferta);
            if (oferta) {
                const imageName = oferta.portada_oferta;
                if (imageName) {
                    fs.unlink('./uploads/ofertas/' + imageName, (err) => {
                        // if (err) {
                        //     res.status(500).send({ message: "Error al eliminar la imagen" });
                        // } else {
                        res.status(200).send({ message: "Imagen eliminada y oferta eliminada exitosamente" });
                        // }
                    });
                } else {
                    // No imageName, proceed with category deletion
                    res.status(200).send({ message: "Oferta eliminada exitosamente" });
                }
            } else {
                res.status(404).send({ message: "Oferta no encontrada" });
            }
        } else {
            res.status(403).send({ message: "Acceso denegado" });
        }
    } else {
        res.status(403).send({ message: "Acceso denegado" });
    }
};

module.exports = {
    registro_oferta_admin,
    listar_ofertas_admin,
    obtener_portada_oferta,
    obtener_oferta_admin,
    actualizar_oferta_admin,
    eliminar_oferta_admin,
};
