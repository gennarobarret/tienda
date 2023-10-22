'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    estado: { type: Boolean, default: true, required: true },
    oferta: { type: Boolean, required: true },
    descuento_oferta: { type: Number, default: NaN, required: true },
    fin_oferta: { type: Date, default: null, required: true },
    portada: { type: String, default: null, required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);

