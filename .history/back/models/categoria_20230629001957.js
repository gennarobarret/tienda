'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    estado: { type: String, default: 1, required: true },
    oferta: { type: Number, required: true },
    portada: { type: String, required: false },
    descuento_oferta: { type: Number, default: 0, required: false },
    fin_oferta: { type: String, required: false },
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);