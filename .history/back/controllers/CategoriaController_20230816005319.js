"use strict";

const { Console } = require("console");
const Categoria = require("../models/categoria");
const fs = require("fs");
const path = require("path");




// Function to check if an image already exists based on name, size, and type
function isDuplicateImage(existingImagePath, uploadedFile) {
    const uploadedImageName = uploadedFile.originalFilename;
    const uploadedImageSize = uploadedFile.size;
    const uploadedImageType = uploadedFile.type;

    // console.log(uploadedImageName);
    // console.log(uploadedImageSize);
    // console.log(uploadedImageType);

    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"]; // Add more valid types if needed

    const existingImageStats = fs.statSync(existingImagePath);
    console.log(existingImageStats);
    console.log(existingImagePath);

    console.log(existingImageStats.size === uploadedImageSize, existingImageStats.size);
    console.log(path.basename(existingImagePath) === path.basename(uploadedImageName), path.basename(uploadedImageName));
    console.log(validImageTypes.includes(uploadedImageType), uploadedImageType);
    return (
        existingImageStats.size === uploadedImageSize &&
        path.basename(existingImagePath) === path.basename(uploadedImageName) &&
        validImageTypes.includes(uploadedImageType)
    );
}


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

            let reg = await Categoria.find({ titulo: new RegExp(filtro, "i") });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

//OBTENER PORTADA CATEGORIA
const obtener_portada_categoria = async function (req, res) {
    let img = req.params["img"];
    fs.stat("./uploads/categorias/" + img, function (err) {
        if (!err) {
            let path_img = "./uploads/categorias/" + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = "./uploads/default.jpg";
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
};


// REGISTRO DE CATEGORIA
const registro_categoria_admin = async function (req, res) {
    let data = req.body;
    let categoria_arr = [];
    const titulo = data.titulo.toLowerCase();
    categoria_arr = await Categoria.find({ titulo: { $regex: new RegExp('^' + titulo + '$', 'i') } });
    // console.log(categoria_arr);
    if (categoria_arr.length === 0) {
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

// ACTUALIZAR CATEGORIA
const actualizar_categoria_admin = async function (req, res) {
    let categoria_arr = [];
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        const titulo = data.titulo.toLowerCase();
        categoria_arr = await Categoria.find({
            _id: { $ne: id },
            titulo: { $regex: new RegExp('^' + titulo + '$', 'i') }
        });

        if (categoria_arr.length === 0) {
            if (req.files) {


                let img_path = req.files.portada.path;
                let name = img_path.split('\\');
                let portada_name = name[2];
                // let existingImagePath = path.resolve("./uploads/categorias", portada_name);
                // if (fs.existsSync(existingImagePath) && isDuplicateImage(existingImagePath, req.files.portada)) {
                //     return res.status(400).send({ message: "Duplicate image detected." });
                // }
                // Update category with cover image
                let reg = await Categoria.findByIdAndUpdate({ _id: id }, {
                    titulo: data.titulo,
                    icono: data.icono,
                    estado: data.estado,
                    oferta: data.oferta,
                    descuento_oferta: data.descuento_oferta,
                    fin_oferta: data.fin_oferta,
                    portada: portada_name
                });
                res.status(200).send({ data: reg });
            } else {
                // Update category without cover image
                let reg = await Categoria.findByIdAndUpdate({ _id: id }, {
                    titulo: data.titulo,
                    icono: data.icono,
                    estado: data.estado,
                    oferta: data.oferta,
                    descuento_oferta: data.descuento_oferta,
                    fin_oferta: data.fin_oferta
                });
                res.status(200).send({ data: reg });
            }
        } else {
            res.status(404).send({
                message: 'Ya existe una categoría con el mismo título.',
                data: undefined,
            });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};


// ELIMINAR PRODUCTO
const eliminar_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let id = req.params["id"];
            let reg = await Categoria.findByIdAndRemove({ _id: id });
            fs.stat('./upload/categorias/' + data.portada, (err) => {
                if (!err) {
                    fs.unlink('./uploads/categorias/' + data.image, (err) => {
                        if (err) throw err;
                    });
                }
            });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: "NoAccess" });
        }
    } else {
        res.status(500).send({ message: "NoAccess" });
    }
};

module.exports = {
    registro_categoria_admin,
    listar_categorias_admin,
    obtener_portada_categoria,
    obtener_categoria_admin,
    actualizar_categoria_admin,
    eliminar_categoria_admin,
};
