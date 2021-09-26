'use strict'

var Usuario = require("../modelos/usuario.modelo");
var Empresa = require("../modelos/empresa.modelo");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");
const pdf = require('pdfkit')
const fs = require('fs');
const xlsx = require('xlsx')

var Datos
const { relativeTimeRounding } = require("moment");
const { findOne } = require("../modelos/usuario.modelo");
const { param } = require("../rutas/empresa.rutas");


function admin(req, res) {
  var userModel = new Usuario();

  userModel.usuario = 'Admin';
  userModel.password = '123456';
  userModel.rol = 'ROL_ADMIN'

  Usuario.find({

    $or: [
      { usuario: userModel.usuario }
    ]

  }).exec((err, adminEncontrado) => {
    if (err) return console.log('Error al crear el Admin');

    if (adminEncontrado.length >= 1) {

      return console.log("El admin ya se creo")

    } else {
      bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {

        userModel.password = passwordEncriptada;


        userModel.save((err, adminGuardado) => {

          if (err) return console.log('error en la peticion del Admin')

          if (adminGuardado) {
            console.log('Admin Creado ')

          } else {
            console.log('Error al crear el Admin')
          }
        })
      })
    }
  })
}

function login(req, res) {

  var params = req.body;

   Usuario.findOne({ usuario: params.usuario }, (err, usuarioEncontrado) => {
     if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

     if (usuarioEncontrado) {
       bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
         if (passVerificada) {
           if (params.getToken === 'true') {
             return res.status(200).send({
               token: jwt.createToken(usuarioEncontrado)
             })

           } else {
             usuarioEncontrado.password = undefined;
             return res.status(200).send({ usuarioEncontrado });
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

  

function agregarEmpleado(req, res) {
  var empleadoModel = new Usuario();
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'solo las Empresas pueden agregar Empleados' })
  } else {



    if (params.nombre && params.puesto && params.departamento) {

        empleadoModel.nombre = params.nombre,
        empleadoModel.puesto = params.puesto,
        empleadoModel.departamento = params.departamento,
        empleadoModel.rol = 'ROL_EMPLEADO'
        empleadoModel.empleadoEmpresa = req.user.sub;

      Usuario.find({
        $or: [
          { nombre: empleadoModel.nombre }
        ]

      }).exec((err, empleadoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion del empleado' });

        if (empleadoEncontrado && empleadoEncontrado.length >= 1) {
          return res.status(500).send({ mensaje: 'El empleado ya existe' });

        } else {
        empleadoModel.save((err, empleadoGuardado) => {
            if (err) return res.status(500).send({ mensaje: 'error en la peticion de guardar el empleado' });

            if (empleadoGuardado) {
              res.status(200).send({ empleadoGuardado })
            } else {
              res.status(404).send({ mensaje: 'no se ha podido registar el empleado' })
            }
          })
        }
      })
    } else {
      return res.status(500).send({ mensaje: 'llene todos los datos necesarios' })
    }
  }
}

function editarEmpleado(req, res) {
  var idEmpleado = req.params.id;
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'no posee los permisos para editar empleados' })
  }

  Usuario.find({ nombre: params.nombre }).exec((err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'error en la peticion' })
    if (empleadoEncontrado && empleadoEncontrado.length >= 1) {
      return res.status(500).send({ mensaje: 'El nombre al que desea modificar ya existe' })

    } else {

      Usuario.findOne({ _id: idEmpleado }).exec((err, empleadoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion al obtener el empleado' });

        if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'Error en la peticion editar o no existen los datos' });

        if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'no posee los permisos para Editar un empleado de una empresa ajena' })

        Usuario.findByIdAndUpdate(idEmpleado, params, { new: true }, (err, empleadoActualizado) => {
          if (err) return res.status(500).send({ mensaje: 'error en la peticion' });

          if (!empleadoActualizado) return res.status(500).send({ mensaje: 'no se ha podido editar el empleado' })

          if (empleadoActualizado) {
            return res.status(200).send({ empleadoActualizado });
          }
        })
      })
    }
  })
}

function eliminarEmpleado(req, res) {
  var idEmpleado = req.params.id;
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No posee los permisos para eliminar empleados' })
  }

  Usuario.findOne({ _id: idEmpleado }).exec((err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar empleado' })
    if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });

    if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'No posee los permisos para eliminar empleados de una empresa ajena' })

    Usuario.findByIdAndDelete(idEmpleado, (err, empleadoEliminado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
      if (!empleadoEliminado) return res.status(500).send({ mensaje: 'no se ha podido eliminar el empleado' });

      if (empleadoEliminado) {
        return res.status(200).send({ mensaje: 'Se ha eliminado el empleado' })
      }
    })
  })
}

function cantidadEmpleado(req, res) {

  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No posee los permisos para buscar a los empleado' })
  }

  if (!params.nombre) {
    return res.status(500).send({ mensaje: 'Parametros Incorrectos' })

  } else {
    if (params.nombre === req.user.nombre) {
      Usuario.find({ empleadoEmpresa: req.user.sub }).count().exec((err, empleadosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error al obtener los empleados' });
        if (!empleadosEncontrados) return res.status(500).send({ mensaje: 'no existen los datos' });

        return res.status(200).send({ mensaje: `La empresa ${req.user.nombre} tiene ${empleadosEncontrados} Empleado(s)` })
      })
    } else {
      return res.status(500).send({ mensaje: 'no puede obtener los empleados de una empresa ajena' })
    }
  }
}

function obtenerEmpleadoId(req, res) {
  var empleadoId = req.params.id;

  Usuario.findOne({ _id: empleadoId }).exec((err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de buscar empresa' })
    if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' });

//  if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'No posee los permisos para buscar empleados de una empresa ajena' })

    Usuario.findById(empleadoId, (err, empleadoEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de empresa' });
      if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'error al obtener la empresa' })
      return res.status(200).send({ empleadoEncontrado });
    })
  })
}

function obtenerEmpleadoNombre(req, res) {

  // var idEmpleado = req.params.id;
  var params = req.body

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No tiene los permisos para buscar un empleado' })
  }

  Usuario.findOne({ nombre: params.nombre }).exec((err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la busqueda del empleado' });
    if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'no existen los datos' });
    if (empleadoEncontrado.empleadoEmpresa != req.user.sub) return res.status(500).send({ mensaje: 'El empleado no existe' })

    return res.status(200).send({ empleadoEncontrado })
  })
}

function obtenerEmpleadoPuesto(req, res) {
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No posee los permisos para buscar empleados' })
  }

  Usuario.find({

    $or: [
      { puesto: params.puesto, empleadoEmpresa: req.user.sub }

    ]


  }).exec((err, empleadoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error al obtener el Empleado' });
    if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'El puesto no existe' });
    return res.status(200).send({ empleadoEncontrado })
  })
}

function obtenerEmpleadoDepartamento(req, res) {
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'No posee los permisos para buscar empleados' })
  }

  Usuario.find({

    $or: [
      { departamento: params.departamento, empleadoEmpresa: req.user.sub }
    ]

  }).exec((err, departamentoEncontrado) => {
    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
    if (!departamentoEncontrado) return res.status(500).send({ mensaje: 'Los datos no existe' });
    return res.status(200).send(departamentoEncontrado)
  })
}

function obtenerEmpleado(req, res) {
  var params = req.body;

  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'no posee los permisos para buscar los empleados' })
  }

  if (params.nombre === req.user.nombre) {

    Usuario.find({ empleadoEmpresa: req.user.sub }).exec((err, empleadoEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Datos' })
      if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'Error en la consulta de usuarios o no tiene datos' })
      return res.status(200).send({ empleadoEncontrado })
    })
  } else {
    return res.status(500).send({ mensaje: 'No pude buscar empleados de una empresa ajena' })
  }
}

function generarPdf(req, res) {
  var params = req.body;


  if (req.user.rol != 'ROL_EMPRESA') {
    return res.status(500).send({ mensaje: 'no posee los permisos para buscar los empleados' })
  }

  if (params.nombre === req.user.nombre) {

    Usuario.find({ empleadoEmpresa: req.user.sub }).exec((err, empleadoEncontrado) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Datos' })
      if (!empleadoEncontrado) return res.status(500).send({ mensaje: 'Error en la consulta de usuarios o no tiene datos' })

      Datos = empleadoEncontrado

      var doc = new pdf();

      doc.pipe(fs.createWriteStream(`./src/pdf/empresa ${req.user.nombre}.pdf`));

      doc.text(`Empleados de la Empresa ${req.user.nombre}`, {
        align: 'center'
      })

      doc.text(Datos, {
        align: 'left'
      })

      doc.end()

    })

    return res.status(500).send({ mensaje: 'PDF generado!!' })

  } else {
    return res.status(500).send({ mensaje: 'No puede generar un pdf de una empresa ajena' })
  }
}

function obtenerUsuarios(req, res) {
   
  Usuario.find().exec((err, usuarios) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Usuarios' });
      if (!usuarios) return res.status(500).send({ mensaje: 'Error en la consutla de Usuarios o no tiene datos' });
      return res.status(200).send({ usuarios });

  })
}

function obtenerEmpleadosPorEmpresa(req, res) {
  var idEmpresa = req.user.sub;

  if (req.user.rol != 'ROL_EMPRESA') {
      return res.status(500).send({ mensaje: 'No posee los permisos para obtener Empleados' });
  }

  Usuario.find({empleadoEmpresa:idEmpresa}).exec((err, empleadosXEmpresa) => {
      if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Empleados' });
      if (!empleadosXEmpresa) return res.status(500).send({ mensaje: 'Error al obtener Empleados' });
      return res.status(200).send({ empleadosXEmpresa });
  })
}


module.exports = {
  admin,
  login,
  agregarEmpleado,
  editarEmpleado,
  eliminarEmpleado,
  cantidadEmpleado,
  obtenerEmpleadoId,
  obtenerEmpleadoNombre,
  obtenerEmpleadoPuesto,
  obtenerEmpleadoDepartamento,
  obtenerEmpleado,
  obtenerUsuarios,
  obtenerEmpleadosPorEmpresa,
  generarPdf
}