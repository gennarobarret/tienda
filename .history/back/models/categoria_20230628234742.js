'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    oferta: { type: Number, required: true },
    portada: { type: String, required: false },
    descuento_oferta: { type: Number, required: false },
    fin_oferta: { type: String, required: false },
    estado: { type: String, ddefault: "Edicion", required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);