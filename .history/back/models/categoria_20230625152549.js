'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    oferta: { type: Number, required: true },
    portada: { type: String, required: true },
    precio: { type: Number, required: true },
    precio: { type: Number, required: true },
    estado: { type: String, default: "Edicion", required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);