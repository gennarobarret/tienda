'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Subcategoria = require("../models/subcategoria");// Asegúrate de importar el modelo de Subcategoria

var CategoriaSchema = Schema({
    nombre_categoria: { type: String, required: true },
    icono_categoria: { type: String, required: true },
    estado_categoria: { type: Boolean, default: true, required: true },
    ofertas_categoria: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'oferta',
    }],
},
    { timestamps: true }
);

CategoriaSchema.pre('remove', async function (next) {
    const subcategorias = await Subcategoria.find({ categoria: this._id });
    subcategorias.forEach(async (subcategoria) => {
        await subcategoria.remove();
    });
    next();
});

module.exports = mongoose.model('categoria', CategoriaSchema);
