'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubCategoriaSchema = Schema({
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'categoria' },
    titulo: { type: String, required: true },
    estado: { type: Boolean, required: true },
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Oferta',
},
    { timestamps: true }
);

module.exports = mongoose.model('subcategoria', SubCategoriaSchema);