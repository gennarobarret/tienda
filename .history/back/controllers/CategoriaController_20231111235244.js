"use strict";

const Categoria = require("../models/categoria");

// OBTENER CATEGORIA
const obtener_categoria_admin = async function (req, res) {
    try {
        if (!req.user) {
            return res.status(401).send({ message: "Acceso denegado" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).send({ message: "Desautorizado" });
        }

        const id = req.params.id;
        const reg = await Categoria.findById(id).populate('ofertas_categoria');

        if (!reg) {
            return res.status(404).send({ message: "Categoría no encontrada" });
        }

        res.status(200).send({ data: reg });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: "Error al obtener datos, Error interno del servidor" });
    }
};


// REGISTRAR CATEGORIA
const registro_categoria_admin = async function (req, res) {
    try {
        const data = req.body;
        console.log(data);



        if (!data.ofertas_categoria) {
            data.ofertas_categoria = [];
        } else {
            const ofertasIds = data.ofertas_categoria.split(',').map((id) => ({ _id: id.trim() }));
            data.ofertas_categoria = ofertasIds;

            console.log(ofertasIds);
        }


        // const nombre_categoria = data.nombre_categoria.toLowerCase();
        // const categoria_arr = await Categoria.find({
        //     nombre_categoria: { $regex: new RegExp('^' + nombre_categoria + '$', 'i') }
        // });

        // if (categoria_arr.length > 0) {
        //     return res.status(409).send({
        //         message: 'Ya existe una categoría con el mismo título.',
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
        // data.estado_categoria = data.estado_categoria === 'undefined' ? true : data.estado_categoria === 'true';

        // const reg = await Categoria.create(data);

        // res.status(200).send({ data: reg });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error al registrar los datos, Error interno del servidor" });
    }
};


// LISTAR DE CATEGORIA
const listar_categorias_admin = async function (req, res) {
    try {
        if (!req.user) {
            return res.status(401).send({ message: "Acceso denegado" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).send({ message: "Desautorizado" });
        }

        const filtro = req.params.filtro;

        const reg = await Categoria.find({
            nombre_categoria: new RegExp(filtro, "i")
        }).populate('ofertas_categoria');
        // console.log(reg);
        // // Loop through the 'ofertas' array and log each object's properties
        // for (const subcategoria of reg) {
        //     // console.log(`SubCategoria: ${categoria.nombre_categoria}`);
        //     console.log(`Estado: ${subcategoria.estado_categoria}`);
        //     console.log('Categoria:', categoria.categoria.nombre_categoria);
        //     console.log('Ofertas:');
        //     categoria.ofertas.forEach((oferta, index) => {
        //         console.log(`  Oferta ${index + 1}:`);
        //         console.log(`    Nombre: ${oferta.nombre_oferta}`);
        //         // Log other fields of the oferta object here
        //     });
        // }

        res.status(200).send({ data: reg });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: "Error al listar los datos, Error interno del servidor" });
    }
};

// ACTUALIZAR CATEGORIA
const actualizar_categoria_admin = async function (req, res) {
    try {
        if (!req.user) {
            return res.status(401).send({ message: 'Acceso denegado' });
        }
        if (req.user.role !== "admin") {
            return res.status(403).send({ message: "Desautorizado" });
        }
        const id = req.params.id;
        const data = req.body;
        if (!data.ofertas_categoria) {
            data.ofertas_categoria = [];
        }
        const nombre_categoria = data.nombre_categoria.toLowerCase();
        const categoria_arr = await Categoria.find({
            _id: { $ne: id },
            nombre_categoria: { $regex: new RegExp('^' + nombre_categoria + '$', 'i') }
        });
        if (categoria_arr.length > 0) {
            return res.status(409).send({
                message: 'Ya existe una categoría con el mismo título.',
                data: undefined,
            });
        }
        const reg = await Categoria.findByIdAndUpdate(id, {
            nombre_categoria: data.nombre_categoria,
            icono_categoria: data.icono_categoria,
            estado_categoria: data.estado_categoria,
            ofertas_categoria: data.ofertas_categoria,
        });
        if (!reg) {
            return res.status(404).send({ message: 'Categoría no encontrada' });
        }
        console.log('reg', reg);
        res.status(200).send({ data: reg });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Error al actualizar los datos, Error interno del servidor' });
    }
};

// ELIMINAR CATEGORIA
const eliminar_categoria_admin = async function (req, res) {
    try {
        const id = req.params.id;
        if (!req.user) {
            return res.status(401).send({ message: "Acceso denegado" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).send({ message: "Desautorizado" });
        }

        const categoria = await Categoria.findById(id);

        if (!categoria) {
            return res.status(404).send({ message: "Categoría no encontrada" });
        }

        await categoria.remove();
        res.status(200).send({ message: "Categoría y subcategorías eliminadas exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error al eliminar los datos, Error interno del servidor" });
    }
};

module.exports = {
    registro_categoria_admin,
    listar_categorias_admin,
    obtener_categoria_admin,
    actualizar_categoria_admin,
    eliminar_categoria_admin,
};
