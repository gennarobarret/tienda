"use strict";

const Subcategoria = require("../models/subcategoria");


// OBTENER SUBCATEGORIA
const obtener_subcategoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let id = req.params["id"];

            try {
                let reg = await Subcategoria
                    .findById({ _id: id })
                    .populate('categoria_subcategoria') // Populate the 'categoria' field
                    .populate('ofertas_subcategoria');  // Populate the 'ofertas' field

                console.log(reg);

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

// LISTAR DE SUBCATEGORIA
const listar_subcategorias_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let filtro = req.params["filtro"];

            try {
                let reg = await Subcategoria
                    .find({ nombre_subcategoria: new RegExp(filtro, "i") })
                    .populate('categoria_subcategoria') // Populate the 'categoria' field
                    .populate('ofertas_subcategoria');  // Populate the 'ofertas' field

                // // Loop through the 'ofertas' array and log each object's properties
                // for (const subcategoria of reg) {
                //     console.log(`SubCategoria: ${subcategoria.nombre_subcategoria}`);
                //     console.log(`Estado: ${subcategoria.estado_subcategoria}`);
                //     console.log('Categoria:', subcategoria.categoria.nombre_categoria);

                //     console.log('Ofertas:');
                //     subcategoria.ofertas.forEach((oferta, index) => {
                //         console.log(`  Oferta ${index + 1}:`);
                //         console.log(`  Nombre: ${oferta.nombre_oferta}`);
                //         // Log other fields of the oferta object here
                //     });
                // }

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


// REGISTRO DE SUBCATEGORIA
// const registro_subcategoria_admin = async function (req, res) {
//     try {
//         let data = req.body;
//         let subcategoria_arr = [];
//         const nombre_subcategoria = data.nombre_subcategoria.toLowerCase();
//         subcategoria_arr = await Subcategoria.find({ nombre_subcategoria: { $regex: new RegExp('^' + nombre_subcategoria + '$', 'i') } });

//         if (subcategoria_arr.length === 0) {
//             if (req.user && req.user.role === "admin") {
//                 let reg = await Subcategoria.create(data);
//                 res.status(200).send({ data: reg });
//             } else {
//                 res.status(403).send({ message: "NoAccess" });
//             }
//         } else {
//             res.status(409).send({
//                 message: 'Ya existe una categoría con el mismo título.',
//                 data: undefined,
//             });
//         }

//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: "Internal Server Error" });
//     }
// };

// REGISTRAR SUBCATEGORIA
const registro_subcategoria_admin = async function (req, res) {
    try {
        const data = req.body;
        console.log(data);
        if (!data.ofertas_subcategoria) {
            data.ofertas_subcategoria = [];
        } else {
            const ofertasIds = data.ofertas_subcategoria.split(',').map((id) => ({ _id: _id }));
            data.ofertas_subcategoria = ofertasIds;
            console.log(ofertasIds);
        }

        // const nombre_subcategoria = data.nombre_subcategoria.toLowerCase();

        // const categoria_arr = await Subcategoria.find({
        //     nombre_subcategoria: { $regex: new RegExp('^' + nombre_subcategoria + '$', 'i') }
        // });

        // if (categoria_arr.length > 0) {
        //     return res.status(409).send({
        //         message: 'Ya existe una subcategoría con el mismo título.',
        //         data: undefined,
        //     });
        // }

        // if (!req.user) {
        //     return res.status(401).send({ message: "Acceso denegado" });
        // }

        // if (req.user.role !== "admin") {
        //     return res.status(403).send({ message: "Desautorizado" });
        // }

        // // Configurar el campo 'estado_oferta'
        // data.estado_subcategoria = data.estado_subcategoria === 'undefined' ? true : data.estado_categoria === 'true';

        // const reg = await Subcategoria.create(data);

        // res.status(200).send({ data: reg });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error al registrar los datos, Error interno del servidor" });
    }
};

// ACTUALIZAR DE SUBCATEGORIA
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

// ELIMINAR SUBCATEGORIA
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