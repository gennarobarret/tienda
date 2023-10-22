const Subcategoria = require('../models/subcategoria');

const fs = require('fs');
const path = require('path');

// Obtener todas las subcategorías
const getAllSubcategorias = async (req, res) => {
    try {
        const subcategorias = await Subcategoria.find();
        res.status(200).json(subcategorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las subcategorías.' });
    }
};

// Crear una nueva subcategoría
const createSubcategoria = async (req, res) => {
    try {
        const data = req.body;
        const subcategoria = new Subcategoria(data);
        await subcategoria.save();
        res.status(200).json(subcategoria);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la subcategoría.' });
    }
};

// Obtener una subcategoría por ID
const getSubcategoriaById = async (req, res) => {
    try {
        const id = req.params.id;
        const subcategoria = await Subcategoria.findById(id);
        if (!subcategoria) {
            return res.status(404).json({ message: 'Subcategoría no encontrada.' });
        }
        res.status(200).json(subcategoria);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la subcategoría.' });
    }
};

// Actualizar una subcategoría por ID
const updateSubcategoriaById = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const subcategoria = await Subcategoria.findByIdAndUpdate(id, data, { new: true });
        if (!subcategoria) {
            return res.status(404).json({ message: 'Subcategoría no encontrada.' });
        }
        res.status(200).json(subcategoria);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la subcategoría.' });
    }
};

// Eliminar una subcategoría por ID
const deleteSubcategoriaById = async (req, res) => {
    try {
        const id = req.params.id;
        const subcategoria = await Subcategoria.findByIdAndRemove(id);
        if (!subcategoria) {
            return res.status(404).json({ message: 'Subcategoría no encontrada.' });
        }
        // Elimina la imagen de portada si existe
        if (subcategoria.portada_subcategoria) {
            const imagePath = `./uploads/categorias/${subcategoria.portada_subcategoria}`;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        res.status(200).json({ message: 'Subcategoría eliminada exitosamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la subcategoría.' });
    }
};


// Obtener subcategorías con información de sus categorías correspondientes usando $lookup
const getSubcategoriasWithCategorias = async (req, res) => {
    try {
        const subcategorias = await Subcategoria.aggregate([
            {
                $lookup: {
                    from: 'categorias', // Nombre de la colección de categorías
                    localField: 'categoria', // Campo en la colección de subcategorías
                    foreignField: '_id', // Campo en la colección de categorías
                    as: 'categoriaInfo' // Nombre del nuevo campo que contendrá la información de la categoría
                }
            },
            {
                $unwind: '$categoriaInfo' // Deshace el arreglo resultante de $lookup
            }
        ]);
        res.status(200).json(subcategorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las subcategorías con información de categorías.' });
    }
};

module.exports = {
    getAllSubcategorias,
    createSubcategoria,
    getSubcategoriaById,
    updateSubcategoriaById,
    deleteSubcategoriaById,
    getSubcategoriasWithCategorias,
};
