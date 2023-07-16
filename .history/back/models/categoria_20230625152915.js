'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    oferta: { type: Number, required: true },
    img_oferta: { type: String, required: true },
    precio_oferta: { type: Number, required: true },
    descuento_oferta: { type: Number, required: true },
    fin_oferta: { type: String, required: false },
    estado: { type: String, default: "Edicion", required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);