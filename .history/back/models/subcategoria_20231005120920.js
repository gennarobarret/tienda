'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubCategoriaSchema = Schema({
    nombre_subcategoria: { type: String, required: true },
    estado_subcategoria: { type: Boolean, required: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'categoria' },
    oferta: [{ type: mongoose.Schema.Types.ObjectId, ref: 'oferta' }],
},
    { timestamps: true }
);

module.exports = mongoose.model('subcategoria', SubCategoriaSchema);