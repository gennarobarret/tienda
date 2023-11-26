'use strict';

var Admin = require('../models/admin');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');

const registro_admin = async function (req, res) {
  try {
    var data = req.body;
    var admin = await Admin.findOne({ email: data.email });

    if (admin) {
      return res.status(200).send({ message: 'El correo ya existe en la base de datos', data: undefined });
    }

    if (!data.password) {
      return res.status(400).send({ message: 'No hay una contraseña', data: undefined });
    }

    const hash = await bcrypt.hash(data.password, null, null);

    if (hash) {
      data.password = hash;
      var reg = await Admin.create(data);
      return res.status(200).send({ data: reg });
    } else {
      return res.status(500).send({ message: 'Error en el servidor al encriptar la contraseña', data: undefined });
    }
  } catch (error) {
    return res.status(500).send({ message: 'Error en el servidor', data: undefined });
  }
};

const login_admin = async function (req, res) {
  try {
    var data = req.body;
    var user = await Admin.findOne({ email: data.email });
    if (!user) {
      return res.status(404).send({ message: 'No se encontró el correo', data: undefined });
    }
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (passwordMatch) {
      return res.status(200).send({ data: user, token: jwt.createToken(user) });
    } else {
      return res.status(401).send({ message: 'La contraseña no coincide', data: undefined });
    }
  } catch (error) {
    return res.status(500).send({ message: 'Error en el servidor', data: undefined });
  }
};

module.exports = {
  registro_admin,
  login_admin,
};
