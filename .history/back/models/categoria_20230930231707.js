'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    estado: { type: Boolean, default: true, required: true },
    ofertas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'oferta',
    }],
    oferta: { type: Boolean, required: true },
    descuento_oferta: { type: Number, default: 0 },
    fin_oferta: { type: Date, default: null },
    portada: { type: String, default: null },
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);

