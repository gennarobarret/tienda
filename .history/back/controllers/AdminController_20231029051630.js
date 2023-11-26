'use strict';

const Admin = require('../models/admin');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../helpers/jwt');

const registro_admin = async function (req, res) {
  try {
    const data = req.body;
    const adminExists = await Admin.find({ email: data.email });

    if (adminExists.length === 0) {
      if (data.password) {
        const hash = await bcrypt.hashSync(data.password);
        data.password = hash;
        const newAdmin = await Admin.create(data);
        res.status(200).send({ data: newAdmin });
      } else {
        res.status(400).send({ message: 'No password provided', data: undefined });
      }
    } else {
      res.status(400).send({ message: 'Email already exists in the database', data: undefined });
    }
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: undefined });
  }
};

const login_admin = async function (req, res) {
  try {
    const data = req.body;
    const admin = await Admin.findOne({ email: data.email });

    if (!admin) {
      res.status(400).send({ message: 'Email not found', data: undefined });
    } else {
      const passwordMatch = await bcrypt.compare(data.password, admin.password);
      if (passwordMatch) {
        const token = jwt.createToken(admin);
        res.status(200).send({ data: admin, token });
      } else {
        res.status(400).send({ message: 'Incorrect password', data: undefined });
      }
    }
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: undefined });
  }
};

module.exports = {
  registro_admin,
  login_admin,
};
