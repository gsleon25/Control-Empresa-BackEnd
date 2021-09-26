'use strict'

var Producto = require("../modelos/producto.modelo");
var Empresa = require("../modelos/empresa.modelo")
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../servicios/jwt");

function agregarProducto(req,res){
    //if (req.user.rol === "ROL_ADMIN"){
        var productoModel = new Producto();
        var params = req.body;

        if (req.user.rol != 'ROL_EMPRESA') {
            return res.status(500).send({ mensaje: 'solo las Empresas pueden agregar Productos' })
          } else {    

    if(params.nombre && params.proveedor && params.precio && params.stock && params.cantidadVendida){
        productoModel.productoEmpresa = req.user.sub;
        productoModel.nombre = params.nombre;
        productoModel.proveedor = params.proveedor;
        productoModel.precio = params.precio;
        productoModel.stock = params.stock;
        productoModel.cantidadVendida = params.cantidadVendida
        productoModel.imagen = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Empty_set.svg/480px-Empty_set.svg.png";

        Producto.find({nombre:productoModel.nombre}).exec((err, productoEncontrado)=>{
            if(err) return res.status(500).send({mensaje: 'Error en la solicitud producto'});

            if(productoEncontrado && productoEncontrado.length >=1){
                return res.status(200).send({mensaje:'Este producto ya existe'});
            }else{
                productoModel.save((err, productoGuardado)=>{
                    if(err) return res.status(500).send({mensaje: 'Error al guardar'});

                    if (productoGuardado){
                       return res.status(200).send(productoGuardado);
                    }else{
                       return res.status(404).send({ mensaje: 'No se ha podido registrar el producto'});
                    }
                })
            }
        })
    }else{
        return res.status(404).send({ mensaje: 'No ingreso todos los datos'});
    }
    
    //}else{
        //return res.status(404).send({ mensaje: 'No tiene permiso para realizar esta acción'});
   // }
}
    
}

function editarProducto(req, res) {
    if (req.user.rol === "ROL_EMPRESA"){
    var idProducto = req.params.id;
    var params = req.body;


    Producto.findByIdAndUpdate(idProducto, params, { new: true }, (err, productoActualizado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoActualizado) return res.status(500).send({ mensaje: 'No se a podido editar el producto' });

        return res.status(200).send({ productoActualizado })
    })
    }else{

        return res.status(404).send({ mensaje: 'No tiene permiso para editar el producto'});
    }

  
}

function eliminarProducto(req, res){
    if (req.user.rol === "ROL_EMPRESA"){
    var idProducto = req.params.id;

    Producto.findByIdAndDelete(idProducto, (err, productoEliminado) =>{
        if(err) return res.status(500).send({mensaje: "Error en la peticion"});
        if(!productoEliminado) return res.status(500).send({mensaje:"No se ha encontrado el producto"});

        return res.status(200).send({mensaje: "producto eliminado"});
    })
    }else{
        return res.status(404).send({ mensaje: 'No tiene permiso para eliminar el producto'});
    }
    
}

function listarProductos(req, res){
    Producto.find().exec((err, productos)=>{
        if(err) return res.status(500).send({ mensaje:"Error al realizar la solicitud de obtener productos" });
        if(!productos) return res.status(500).send({ mensaje:"No se encontraron productos" });

        return res.status(200).send({ productos });
    })
}

function listarProductosPorEmpresa(req, res) {
    var idProducto = req.user.sub;
  
    if (req.user.rol != 'ROL_EMPRESA') {
        return res.status(500).send({ mensaje: 'No posee los permisos para listar Productos' });
    }
  
    Producto.find({productoEmpresa:idProducto}).exec((err, productosXEmpresa) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Productos' });
        if (!productosXEmpresa) return res.status(500).send({ mensaje: 'Error al lsitar Productos' });
        return res.status(200).send({ productosXEmpresa });
    })
  }

function buscarProductosNom(req, res) {
    var nombre = req.body.nombre;

    Producto.find({"nombre": nombre },(err, productosEncontrados)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de productos'});
        if(!productosEncontrados) return res.status(500).send({mensaje: 'Error al obtener los productos' });

        return res.status(200).send({ productosEncontrados });
    })

}

function obtenerProductoId(req, res){
    var proID = req.params.id;

    Producto.findById({_id:proID }, (err, producEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Producto' });
        if (!producEncontrado) return res.status(500).send({ mensaje: 'Error al obtener el Producto' });
        return res.status(200).send({ producEncontrado });
    })
}



module.exports = {
    agregarProducto,
    editarProducto,
    eliminarProducto,
    listarProductos,
    listarProductosPorEmpresa,
    buscarProductosNom,
    obtenerProductoId
}