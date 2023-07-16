'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    categorias: [{ type: Object, required: true }],
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    estado: { type: String, default: "Edicion", required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('categorias', CategoriaSchema);