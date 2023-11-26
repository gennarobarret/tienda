"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    titulo_producto: { type: String, required: true },
    slug_producto: { type: String, required: true },
    galeria_producto: [{ type: Object, required: false }],
    portada_producto: { type: String, required: true },
    contenido_producto: { type: String, required: true },
    nventas_producto: { type: Number, default: 0, required: true },
    npuntos_producto: { type: Number, default: 0, required: true },
    variations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariation'
    }],
    categoria_producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categoria'
    },
    subcategoria_producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategoria'
    },
    ofertas_producto: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'oferta'
    }],
    estado: { type: String, default: "Edicion", required: true }
},
    { timestamps: true });

module.exports = mongoose.model("producto", ProductoSchema);

