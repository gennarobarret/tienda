'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubCategoriaSchema = Schema({
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'categoria' },
    titulo: { type: String, required: true },
    estado: { type: Boolean, required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('subcategorias', SubCategoriaSchema);