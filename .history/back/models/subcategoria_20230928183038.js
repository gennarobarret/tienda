'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubCategoriaSchema = Schema({
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria' },
    titulo: { type: String, required: true },
    estado: { type: String, default: "Edicion", required: true },
    oferta: { type: Boolean, required: true },
    descuento_oferta: { type: Number, default: 0 },
    fin_oferta: { type: Date, default: null },
    portada: { type: String, default: null },
},
    { timestamps: true }
);

module.exports = mongoose.model('subcategorias', SubCategoriaSchema);