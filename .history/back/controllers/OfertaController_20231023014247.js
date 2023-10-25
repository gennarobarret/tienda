"use strict";

const Oferta = require("../models/oferta");
const fs = require("fs");
const path = require("path");

//OBTENER CATEGORIA
const obtener_oferta_admin = async function (req, res) {
    try {
        // Verificar autorización
        if (!req.user) {
            return res.status(401).send({ message: "Acceso denegado" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).send({ message: "Desautorizado" });
        }
        let id = req.params["id"];
        let reg = await Oferta.findById(id);
        if (!reg) {
            return res.status(404).send({ message: "Oferta no encontrada" });
        }
        res.status(200).send({ data: reg });
    } catch (error) {
        res.status(500).send({ message: "Error al obtener los datos, Error interno del servidor" });
    }
};


//LISTAR DE CATEGORIA
const listar_ofertas_admin = async function (req, res) {
    try {
        // Verificar autorización
        if (!req.user) {
            return res.status(401).send({ message: "Acceso denegado" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).send({ message: "Desautorizado" });
        }
        const filtroText = req.params["filtro"];
        let reg = await Oferta.find({ nombre_oferta: new RegExp(filtroText, "i") });
        // Filtrar ofertas con fecha incorrecta
        for (let i = 0; i < reg.length; i++) {
            const oferta = reg[i];
            // if (oferta.fin_oferta < oferta.inicio_oferta) {
            //     // Borrar oferta automáticamente
            //     await Oferta.findByIdAndDelete(oferta._id);
            // }
        }
        // Recuperar las ofertas nuevamente después de eliminar las incorrectas
        reg = await Oferta.find({ nombre_oferta: new RegExp(filtroText, "i") });
        res.status(200).send({ data: reg });
    } catch (error) {
        res.status(500).send({ message: "Error al listar los datos, Error interno del servidor" });
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

const registro_oferta_admin = async function (req, res) {
    try {
        const data = req.body;
        const nombre_oferta = data.nombre_oferta.toLowerCase();

        // Verificar si ya existe una oferta con el mismo título
        const ofertaExists = await Oferta.findOne({ nombre_oferta });

        if (ofertaExists) {
            return res.status(409).send({
                message: 'Ya existe una oferta con el mismo título.',
                data: undefined,
            });
        }

        // Verificar autorización
        if (!req.user) {
            return res.status(401).send({ message: "Acceso denegado" });
        }
        if (req.user.role !== "admin") {
            return res.status(403).send({ message: "Desautorizado" });
        }

        // Configurar el campo 'estado_oferta'
        data.estado_oferta = typeof data.estado_oferta === 'undefined' ? true : data.estado_oferta === 'true';

        if (data.estado_oferta) {
            // Manejar la imagen de portada si se proporciona
            if (req.files && req.files.portada_oferta) {
                const portada_oferta_name = req.files.portada_oferta.path.split("\\").pop();
                data.portada_oferta = portada_oferta_name;
            } else {
                data.portada_oferta = null;
            }
        } else {
            // Establecer la fecha de finalización y validar descuento
            data.fin_oferta = new Date("2000-01-01T00:00:00.000Z");
            data.descuento_oferta = parseFloat(data.descuento_oferta);
            data.descuento_oferta = isNaN(data.descuento_oferta) ? 0 : data.descuento_oferta;
        }

        // Crear la oferta
        const reg = await Oferta.create(data);
        res.status(200).send({ data: reg });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error al registrar los datos, Error interno del servidor" });
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
                res.status(500).send({ message: 'Error al actualizar los datos, Error interno del servidor' });
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
