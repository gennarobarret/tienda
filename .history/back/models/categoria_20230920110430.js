'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    estado: { type: Boolean, default: true, required: true },
    oferta: { type: Boolean, required: true },
    descuento_oferta: { type: Number, default: 0, required: false },
    fin_oferta: { type: String, required: false },
    portada: { type: String, default: null },
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);

