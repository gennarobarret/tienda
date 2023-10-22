'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OfertaSchema = Schema({
    oferta: { type: Boolean, required: true },
    descuento_oferta: { type: Number, default: 0 },
    descripcion_oferta: { type: String, default: 0 },
    fin_oferta: { type: Date, default: null },
    portada: { type: String, default: null },
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', OfertaSchema);

