"use strict";

const Subcategoria = require("../models/subcategoria");
const fs = require("fs");
const path = require("path");


// REGISTRO DE SUBCATEGORIA
const registro_subcategoria_admin = async function (req, res) {
    try {
        let data = req.body;
        let subcategoria_arr = [];
        const titulo = data.titulo.toLowerCase();
        subcategoria_arr = await Subcategoria.find({ titulo: { $regex: new RegExp('^' + titulo + '$', 'i') } });

        if (subcategoria_arr.length === 0) {
            if (req.user && req.user.role === "admin") {
                if (data.oferta == 'true') {
                    if (req.files && req.files.portada) {
                        let portada_name = req.files.portada.path.split("\\").pop();
                        data.portada = portada_name;
                    } else {
                        // Si no se proporciona un archivo de portada, establece el campo 'portada' en null.
                        data.portada = null;
                    }
                } else {
                    data.fin_oferta = new Date("2000-01-01T00:00:00.000Z");
                    // Asegúrate de que el campo "descuento_oferta" sea un número válido
                    if (typeof data.descuento_oferta !== 'undefined') {
                        data.descuento_oferta = parseFloat(data.descuento_oferta);
                        if (isNaN(data.descuento_oferta)) {
                            // Si no es un número válido, se establece en cero.
                            data.descuento_oferta = 0;
                        }
                    } else {
                        // Si el valor es undefined, se establece en cero como valor predeterminado.
                        data.descuento_oferta = 0;
                    }
                }

                let reg = await Subcategoria.create(data);
                // Populate the 'categoria' field in the newly created subcategoria
                await reg.populate('categoria').execPopulate();
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

//OBTENER SUBCATEGORIA
const obtener_subcategoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let id = req.params["id"];

            try {
                let reg = await Subcategoria.findById({ _id: id })
                    .populate('categoria'); // Use populate to join with the 'categoria' model

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


//LISTAR DE SUBCATEGORIA
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

//OBTENER PORTADA SUBCATEGORIA
const obtener_portada_subcategoria = async function (req, res) {
    let img = req.params["img"];
    fs.stat("./uploads/subcategorias/" + img, function (err) {
        if (!err) {
            let path_img = "./uploads/subcategorias/" + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = "./uploads/default.jpg";
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
};




// ACTUALIZAR DE SUBCATEGORIA
const actualizar_subcategoria_admin = async function (req, res) {
    let subcategoria_arr = [];
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        console.log(data);
        const titulo = data.titulo.toLowerCase();
        subcategoria_arr = await Subcategoria.find({
            _id: { $ne: id },
            titulo: { $regex: new RegExp('^' + titulo + '$', 'i') }
        });

        if (subcategoria_arr.length === 0) {
            try {
                if (req.files && req.files.portada) {
                    let img_path = req.files.portada.path;
                    let name = img_path.split('\\');
                    let portada_name = name[2];
                    const existingCategory = await Subcategoria.findById(id);
                    if (existingCategory && existingCategory.portada) {
                        const existingPortadaPath = `uploads/subcategorias/${existingCategory.portada}`;
                        if (fs.existsSync(existingPortadaPath)) {
                            fs.unlinkSync(existingPortadaPath);
                        }
                    }
                    let reg = await Subcategoria.findByIdAndUpdate({ _id: id }, {
                        titulo: data.titulo,
                        icono: data.icono,
                        estado: data.estado,
                        oferta: data.oferta,
                        descuento_oferta: data.descuento_oferta,
                        fin_oferta: data.fin_oferta,
                        portada: portada_name
                    });
                    // Populate the 'categoria' field in the updated subcategoria
                    await reg.populate('categoria').execPopulate();
                    res.status(200).send({ data: reg });
                } else {
                    let reg = await Subcategoria.findByIdAndUpdate({ _id: id }, {
                        titulo: data.titulo,
                        icono: data.icono,
                        estado: data.estado,
                        oferta: data.oferta,
                        descuento_oferta: data.descuento_oferta,
                        fin_oferta: data.fin_oferta
                    });
                    // Populate the 'categoria' field in the updated subcategoria
                    await reg.populate('categoria').execPopulate();
                    res.status(200).send({ data: reg });
                }
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


// ELIMINAR SUBCATEGORIA
const eliminar_subcategoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role === "admin") {
            const id = req.params["id"];
            const subcategoria = await Subcategoria.findByIdAndRemove({ _id: id });
            // console.log(subcategoria);
            if (subcategoria) {
                const imageName = subcategoria.portada;
                if (imageName) {
                    fs.unlink('./uploads/subcategorias/' + imageName, (err) => {
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
    registro_subcategoria_admin,
    listar_subcategorias_admin,
    obtener_portada_subcategoria,
    obtener_subcategoria_admin,
    actualizar_subcategoria_admin,
    eliminar_subcategoria_admin,
};
