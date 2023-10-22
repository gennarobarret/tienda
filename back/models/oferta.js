'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OfertaSchema = Schema({
    nombre_oferta: { type: String, required: true },
    descuento_oferta: { type: Number, default: 0 },
    descripcion_oferta: { type: String, required: true },
    inicio_oferta: { type: Date, default: null },
    fin_oferta: { type: Date, default: null },
    portada_oferta: { type: String, default: null },
    estado_oferta: { type: Boolean, required: true },
},
    { timestamps: true }
);

module.exports = mongoose.model('oferta', OfertaSchema);

