'use strict'

var Empresa = require("../modelos/empresa.modelo");
var Usuario = require("../modelos/usuario.modelo")
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../servicios/jwt");


function loginEmpresa(req, res) {

    var params = req.body;

    Empresa.findOne({ usuario: params.usuario }, (err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

        if (empresaEncontrada) {
            bcrypt.compare(params.password, empresaEncontrada.password, (err, passVerificada) => {
                if (passVerificada) {
                    if (params.getToken === 'true') {
                        return res.status(200).send({
                            token: jwt.createToken(empresaEncontrada)
                        })

                    } else {
                        empresaEncontrada.password = undefined;
                        return res.status(200).send({ empresaEncontrada });
                    }
                } else {
                    return res.status(500).send({ mensaje: 'Contraseña incorrecta' })
                }

            })
        } else {
            return res.status(500).send({ mensaje: 'Usuario incorrecto' })
        }
    })
}

function agregarEmpresa(req, res) {

    var empresaModel = Empresa();
    var params = req.body;

    if (req.user.rol != "ROL_ADMIN") {

        return res.status(500).send({ mensaje: 'Solo los Administradores pueden agregar Empresas' })

    } else {
        if (params.nombre && params.usuario &&params.password) {
            empresaModel.nombre = params.nombre;
            empresaModel.usuario = params.usuario
            empresaModel.password = params.password;
            empresaModel.rol = 'ROL_EMPRESA';

            Empresa.find({

                $or: [
                    { usuario: empresaModel.usuario }
                ]

            }).exec((err, empresaEncontrada) => {

                if (err) return res.status(500).send({ mensaje: 'Error en la peticion del la Empresa' });

                if (empresaEncontrada && empresaEncontrada.length >= 1) {

                    return res.status(500).send({ mensaje: 'La empresa ya existe' })

                } else {

                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {

                        empresaModel.password = passwordEncriptada;

                        empresaModel.save((err, empresaGuardada) => {

                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de guardad Empresa' });

                            if (empresaGuardada) {

                                res.status(200).send({ empresaGuardada })

                            } else {
                                res.status(404).send({ mensaje: 'no se ha podido registrar la Empresa' })
                            }
                        })
                    })
                }
            })

        } else {
            return res.status(500).send({ mensaje: 'llene todos los datos necesarios' })
        }
    }
}

function editarEmpresa(req, res) {


    var idEmpresa = req.params.id;
    var params = req.body;

    if (req.user.sub != idEmpresa) {

        if (req.user.rol != "ROL_ADMIN") {
            return res.status(500).send({ mensaje: "no posee los permisos para modificar" })
        }
    }

    Empresa.find({ nombre: params.nombre }).exec((err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (empresaEncontrada && empresaEncontrada.length >= 1) {
            return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe ' })

        } else {

            Empresa.findOne({ _id: idEmpresa }).exec((err, empresaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la empresa" });

                if (!empresaEncontrada) return res.status(500).send({ mensaje: "Error en la peticion editar o No tienes datos " });

                Empresa.findByIdAndUpdate(idEmpresa, params, { new: true }, (err, empresaactualizada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!empresaactualizada) return res.status(500).send({ mensaje: "No se ha podido editar  la empresa" });

                    if (empresaactualizada) {
                        return res.status(200).send({ empresaactualizada });
                    }
                }
                )
            }
            )
        }
    })
}

function eliminarEmpresa(req, res) {
    var idEmpresa = req.params.id;
    var params = req.body;

    if (req.user.sub != idEmpresa) {

        if (req.user.rol != "ROL_ADMIN") {
            return res.status(500).send({ mensaje: "no posee los permisos para Eliminar " })
        }
    }

    Empresa.findOne({ _id: idEmpresa }).exec((err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la empresa" });

        if (!empresaEncontrada) return res.status(500).send({ mensaje: "no se han encontrado los datos " });

        //eliminar al empleado 
        Usuario.find({ empleadoEmpresa: idEmpresa }).exec((err, empleadoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar empleado' })
            if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });

            // if (empleadoEncontrado.empleadoEmpresa != idEmpresa) return res.status(500).send({ mensaje: 'No posee los permisos para eliminar empleados de una empresa ajena' })

            Usuario.deleteMany({ empleadoEmpresa: idEmpresa }, { multi: true }, (err, empleadoEliminado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if (!empleadoEliminado) return res.status(500).send({ mensaje: 'no se ha podido eliminar el empleado' });

                Empresa.findByIdAndDelete(idEmpresa, (err, empresaEliminada) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en en la peticion' })
                    if (!empresaEliminada) return res.status(500).send({ mensaje: 'no se ha podido eliminar la Empresa' })

                    if (empresaEliminada) {
                        return res.status(200).send({ mensaje: 'Se ha eliminado la Empresa' })
                    }
                })

            })
        })
    })
}

function obtenerEmpresaId(req, res) {
    var empresaId = req.params.id;
  
   
  
    Empresa.findOne({ _id: empresaId }).exec((err, empresaEncontrada) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de buscar empresa' })
      if (!empresaEncontrada) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });
  
      Empresa.findById(empresaId, (err, empresaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de empresa' });
        if (!empresaEncontrada) return res.status(500).send({ mensaje: 'error al obtener la empresa' })
        return res.status(200).send({ empresaEncontrada });
      })
    })
  }


function obtenerEmpresas(req, res) {
   
    Empresa.find().exec((err, empresas) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Empresas' });
        if (!empresas) return res.status(500).send({ mensaje: 'Error en la consutla de Empresas o no tiene datos' });
        return res.status(200).send({ empresas });

    })
}


module.exports = {
    loginEmpresa,
    agregarEmpresa,
    editarEmpresa,
    eliminarEmpresa,
    obtenerEmpresaId,

    obtenerEmpresas
}