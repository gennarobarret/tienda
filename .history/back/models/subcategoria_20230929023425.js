'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubCategoriaSchema = Schema({
    type: mongoose.Schema.Types.ObjectId, ref: 'categoria',
},
    titulo_subcategoria: { type: String, required: true },
    estado_subcategoria: { type: Boolean, required: true },
    oferta_subcategoria: { type: Boolean, required: true },
    descuento_oferta_subcategoria: { type: Number, default: 0 },
    fin_oferta_subcategoria: { type: Date, default: null },
    portada_subcategoria: { type: String, default: null },
},
{ timestamps: true }
);

module.exports = mongoose.model('subcategorias', SubCategoriaSchema);