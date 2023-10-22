'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    nombre_categoria: { type: String, required: true },
    icono_categoria: { type: String, required: true },
    estado_categoria: { type: Boolean, default: true, required: true },
    subcategorias: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategoria',
    }],
    oferta: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'oferta',
    }],
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);

