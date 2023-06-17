"use strict";

var Cliente = require("../models/cliente");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../helpers/jwt");
const { emit } = require("../models/cliente");

const registro_cliente = async function (req, res) {
  try {
    var data = req.body;
    var clientes_arr = [];
    clientes_arr = await Cliente.find({ email: data.email });

    if (clientes_arr.length === 0) {
      if (data.password) {
        bcrypt.hash(data.password, null, null, async function (err, hash) {
          if (hash) {
            data.password = hash;
            var reg = await Cliente.create(data);
            res.status(200).send({ data: reg });
          } else {
            res.status(500).send({ message: "ErrorServer", data: undefined });
          }
        });
      } else {
        res
          .status(400)
          .send({ message: "No se proporcionó una contraseña", data: undefined });
      }
    } else {
      res.status(400).send({
        message: "El correo ya existe en la base de datos",
        data: undefined,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error en el servidor", data: undefined });
  }
};

const login_cliente = async function (req, res) {
  try {
    var data = req.body;
    var cliente_arr = [];

    cliente_arr = await Cliente.find({ email: data.email });

    if (cliente_arr.length === 0) {
      res
        .status(400)
        .send({ message: "No se encontró el correo", data: undefined });
    } else {
      // LOGIN
      let user = cliente_arr[0];
      bcrypt.compare(data.password, user.password, async function (error, check) {
        if (check) {
          res.status(200).send({ data: user, token: jwt.createToken(user) });
        } else {
          res
            .status(400)
            .send({ message: "La contraseña no coincide", data: undefined });
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error en el servidor", data: undefined });
  }
};

const listar_clientes_filtro_admin = async function (req, res) {
  try {
    if (req.user && req.user.role === "admin") {
      let tipo = req.params["tipo"];
      let filtro = req.params["filtro"];

      if (!tipo || tipo === "null") {
        let reg = await Cliente.find();
        res.status(200).send({ data: reg });
      } else {
        if (tipo === "apellidos") {
          let reg = await Cliente.find({ apellidos: new RegExp(filtro, "i") });
          res.status(200).send({ data: reg });
        } else if (tipo === "correo") {
          let reg = await Cliente.find({ email: new RegExp(filtro, "i") });
          res.status(200).send({ data: reg });
        } else {
          res.status(400).send({ message: "Tipo de filtro no válido" });
        }
      }
    } else {
      res.status(403).send({ message: "Acceso no autorizado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error en el servidor", data: undefined });
  }
};

const registro_cliente_admin = async function (req, res) {
  try {
    if (req.user && req.user.role === "admin") {
      var data = req.body;
      var clientes_arr = [];
      const email = data.email.toLowerCase();

      clientes_arr = await Cliente.find({ email: email });

      if (clientes_arr.length === 0) {
        bcrypt.hash("123456789", null, null, async function (error, hash) {
          if (hash) {
            data.password = hash;
            let reg = await Cliente.create(data);
            res.status(200).send({ data: reg });
          } else {
            res.status(500).send({ message: "Hubo un error", data: undefined });
          }
        });
      } else {
        res.status(404).send({ message: "El email ya está registrado.", data: undefined });
      }
    } else {
      res.status(403).send({ message: "Acceso no autorizado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error en el servidor", data: undefined });
  }
};

const obtener_cliente_admin = async function (req, res) {
  try {
    if (req.user && req.user.role === "admin") {
      var id = req.params["id"];

      try {
        var reg = await Cliente.findById(id);
        if (reg) {
          res.status(200).send({ data: reg });
        } else {
          res.status(404).send({ message: "Cliente no encontrado", data: undefined });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error en el servidor", data: undefined });
      }
    } else {
      res.status(403).send({ message: "Acceso no autorizado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error en el servidor", data: undefined });
  }
};

const actualizar_cliente_admin = async function (req, res) {
  try {
    if (req.user && req.user.role === "admin") {
      const id = req.params["id"];
      const params = req.body;

      // Verificar que el email no esté siendo utilizado por otro cliente
      const existingClient = await Cliente.findOne({ email: params.email.toLowerCase() });
      if (existingClient && existingClient._id != id) {
        return res.status(400).send({ message: "El email ya está registrado." });
      }

      Cliente.findByIdAndUpdate(
        id,
        params,
        { new: true },
        (err, data) => {
          if (err || !data) {
            console.error(err);
            return res.status(500).send({ message: "Error al actualizar el cliente", data: undefined });
          }
          res.status(200).send({ status: "success", message: "Cliente actualizado", data: data });
        }
      );
    } else {
      res.status(403).send({ message: "Acceso no autorizado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error en el servidor", data: undefined });
  }
};

const eliminar_cliente_admin = async function (req, res) {
  try {
    if (req.user && req.user.role === "admin") {
      var id = req.params["id"];
      var reg = await Cliente.findByIdAndRemove(id);
      res.status(200).send({ data: reg });
    } else {
      res.status(403).send({ message: "Acceso no autorizado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error en el servidor", data: undefined });
  }
};

module.exports = {
  registro_cliente,
  login_cliente,
  listar_clientes_filtro_admin,
  registro_cliente_admin,
  obtener_cliente_admin,
  actualizar_cliente_admin,
  eliminar_cliente_admin
};
