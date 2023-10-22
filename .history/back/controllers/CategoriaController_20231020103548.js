"use strict";

const Categoria = require("../models/categoria");

const obtener_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let id = req.params["id"];
            try {
                let reg = await Categoria.findById(id)
                    .populate('ofertas_categoria');

                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(500).send({ message: "Error fetching data" });
            }
        } else {
            res.status(403).send({ message: "NoAccess" });
        }
    } else {
        res.status(401).send({ message: "Unauthorized" });
    }
};



const registro_categoria_admin = async function (req, res) {
    try {
        let data = req.body;
        if (!data.ofertas_categoria) {
            // Si data.ofertas_categoria no está definido o es nulo, asigna un array vacío.
            data.ofertas_categoria = [];
        } else {
            // Split the ofertas_categoria string into an array of IDs
            const ofertasIds = data.ofertas_categoria.split(',');
            // Map the IDs to objects with _id property
            const ofertas_categoria = ofertasIds.map((id) => ({ _id: id }));
            data.ofertas_categoria = ofertas_categoria;
        }
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


// LISTAR DE CATEGORIA
const listar_categorias_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "admin") {
            let filtro = req.params["filtro"];

            try {
                let reg = await Categoria
                    .find({ nombre_categoria: new RegExp(filtro, "i") })
                    .populate('ofertas_categoria');
                // console.log(reg);
                // Loop through the 'ofertas' array and log each object's properties
                // for (const subcategoria of reg) {
                //     // console.log(`SubCategoria: ${categoria.nombre_categoria}`);
                //     console.log(`Estado: ${subcategoria.estado_categoria}`);
                //     console.log('Categoria:', categoria.categoria.nombre_categoria);
                //     // console.log('Ofertas:');
                //     // categoria.ofertas.forEach((oferta, index) => {
                //     //     console.log(`  Oferta ${index + 1}:`);
                //     //     console.log(`    Nombre: ${oferta.nombre_oferta}`);
                //     //     // Log other fields of the oferta object here
                //     // });
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


// ACTUALIZAR DE CATEGORIA
const actualizar_categoria_admin = async function (req, res) {
    let categoria_arr = [];
    if (req.user) {
        let id = req.params['id'];
        let data = req.body;
        console.log(data);
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
                        ofertas_categoria: data.ofertas_categoria,
                    });
                    console.log(reg);
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
    const id = req.params["id"];
    try {
        if (req.user) {
            if (req.user.role === "admin") {
                const categoria = await Categoria.findById({ _id: id });
                if (categoria) {
                    await categoria.remove();
                    res.status(200).send({ message: "Categoría y subcategorías eliminadas exitosamente" });
                } else {
                    res.status(404).send({ message: "Categoría no encontrada" });
                }
            } else {
                res.status(403).send({ message: "Acceso denegado" });
            }
        } else {
            res.status(403).send({ message: "Acceso denegado" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

module.exports = {
    registro_categoria_admin,
    listar_categorias_admin,
    obtener_categoria_admin,
    actualizar_categoria_admin,
    eliminar_categoria_admin,
};
