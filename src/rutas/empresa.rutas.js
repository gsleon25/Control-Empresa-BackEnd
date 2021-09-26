'use strict'

var express = require("express");
var empresaControlador = require("../controladores/empresa.controlador");

//MIDDLEWARES
var md_autorizacion = require("../middlewares/authenticated")

//RUTAS

var api=express.Router();

api.post('/registrarEmpresa',md_autorizacion.ensureAuth, empresaControlador.agregarEmpresa);
api.post('/loginEmpresa', empresaControlador.loginEmpresa);
api.put('/editarEmpresa/:id', md_autorizacion.ensureAuth, empresaControlador.editarEmpresa )
api.delete('/eliminarEmpresa/:id', md_autorizacion.ensureAuth, empresaControlador.eliminarEmpresa)
api.get('/obtenerEmpresaId/:id', empresaControlador.obtenerEmpresaId);

api.get('/obtenerEmpresas', empresaControlador.obtenerEmpresas);
module.exports = api;
