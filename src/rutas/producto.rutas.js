'use strict'

var express = require("express");
var productoControlador = require("../controladores/producto.controlador");

//MIDDLEWARES
var md_autorizacion = require("../middlewares/authenticated")

//RUTAS

var api=express.Router();


api.post('/agregarProducto', md_autorizacion.ensureAuth, productoControlador.agregarProducto);
api.put('/editarProducto/:id', md_autorizacion.ensureAuth,productoControlador.editarProducto);
api.delete('/eliminarProducto/:id', md_autorizacion.ensureAuth,productoControlador.eliminarProducto);
api.get('/listarProductos', productoControlador.listarProductos);
api.get('/listarProductoNom', productoControlador.buscarProductosNom);
api.get('/obtenerProductoId/:id', productoControlador.obtenerProductoId);
api.get('/listarProductosPorEmpresa', md_autorizacion.ensureAuth, productoControlador.listarProductosPorEmpresa);


module.exports = api;