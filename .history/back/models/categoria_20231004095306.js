'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    titulo: { type: String, required: true },
    icono: { type: String, required: true },
    estado: { type: Boolean, default: true, required: true },
    oferta: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'oferta',
    }],
},
    { timestamps: true }
);

module.exports = mongoose.model('categoria', CategoriaSchema);

