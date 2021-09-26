'use strict'

var express = require("express");
var usuarioControlador = require("../controladores/usuario.controlador");

//MIDDLEWARES
var md_autorizacion = require("../middlewares/authenticated");

//RUTAS

var api = express.Router();
api.post('/login', usuarioControlador.login);
api.post('/registrarEmpleado',md_autorizacion.ensureAuth,usuarioControlador.agregarEmpleado);
api.put('/editarEmpleado/:id', md_autorizacion.ensureAuth, usuarioControlador.editarEmpleado);
api.delete('/eliminarEmpleado/:id',md_autorizacion.ensureAuth, usuarioControlador.eliminarEmpleado);
api.get('/cantidadEmpleados', md_autorizacion.ensureAuth, usuarioControlador.cantidadEmpleado)
api.get('/obtenerEmpleadoId/:id', usuarioControlador.obtenerEmpleadoId);
api.get('/obtenerEmpleadoNombre', md_autorizacion.ensureAuth, usuarioControlador.obtenerEmpleadoNombre);
api.get('/obtenerEmpleadoPuesto', md_autorizacion.ensureAuth, usuarioControlador.obtenerEmpleadoPuesto);
api.get('/obtenerEmpleadoDepartamento', md_autorizacion.ensureAuth, usuarioControlador.obtenerEmpleadoDepartamento);
api.get('/obtenerUsuarios', usuarioControlador.obtenerUsuarios);
api.get('/obtenerEmpleados', md_autorizacion.ensureAuth, usuarioControlador.obtenerEmpleado)
api.get('/generarPdf',md_autorizacion.ensureAuth, usuarioControlador.generarPdf)
api.get('/obtenerEmpleadosPorEmpresa', md_autorizacion.ensureAuth, usuarioControlador.obtenerEmpleadosPorEmpresa);

module.exports = api;