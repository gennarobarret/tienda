'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubCategoriaSchema = Schema({
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria' }, // referencia al proveedor
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    estado: { type: String, default: "Edicion", required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('categorias', SubCategoriaSchema);