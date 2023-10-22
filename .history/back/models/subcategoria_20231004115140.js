'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubCategoriaSchema = Schema({
    titulo: { type: String, required: true },
    estado: { type: Boolean, required: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'categoria' },
    ofertas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'oferta' }],
},
    { timestamps: true }
);

module.exports = mongoose.model('subcategoria', SubCategoriaSchema);