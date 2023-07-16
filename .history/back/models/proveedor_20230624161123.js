"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProveedorSchema = Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  tax_identification: { type: String, required: true },
  street1: { type: String, required: true },
  street2: { type: String, required: false },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  availability: { type: String, default: "Edicion", required: true },
},
  { timestamps: true }
);
module.exports = mongoose.model("proveedor", ProveedorSchema);