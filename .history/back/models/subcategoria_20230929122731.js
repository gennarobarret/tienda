'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubCategoriaSchema = Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categoria' },
    titulo_subcategoria: { type: String, required: true },
    estado_subcategoria: { type: Boolean, required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('subcategorias', SubCategoriaSchema);