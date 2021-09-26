'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    productoEmpresa: {type: Schema.Types.ObjectId, ref: 'empresas' },
    nombre: String,
    proveedor: String,
    precio: Number,
    stock: Number,
    cantidadVendida: Number,
    imagen: String
    
});

module.exports = mongoose.model('productos', ProductoSchema);