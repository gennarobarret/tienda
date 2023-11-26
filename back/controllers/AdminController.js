'use strict';

var Admin = require('../models/admin');
var bcrypt = require('bcrypt');
var jwt = require('../helpers/jwt');

//CREATE ADMIN
const create_admin = async function (req, res) {
  try {
    const data = req.body;
    console.log("🚀 ~ file: AdminController.js:10 ~ data:", data);
    const adminExists = await Admin.findOne({ email: data.email });
    if (adminExists) {
      return res.status(200).send({ message: 'Email already exists in the database', data: undefined });
    }
    if (!data.password) {
      return res.status(200).send({ message: 'No password provided', data: undefined });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    const reg = await Admin.create(data);
    res.status(200).send({ data: reg });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send({ message: 'Server error', data: undefined });
  }
};


//LOGIN ADMIN
const login_admin = async function (req, res) {
  var data = req.body;
  var admin_arr = [];

  admin_arr = await Admin.find({ email: data.email });

  if (admin_arr.length == 0) {
    res.status(200).send({ message: 'Email not found', data: undefined });
  } else {
    // LOGIN
    let user = admin_arr[0];
    bcrypt.compare(data.password, user.password, async function (error, check) {
      if (check) {
        res.status(200).send({ data: user, token: jwt.createToken(user) });
      } else {
        res.status(200).send({ message: 'Incorrect password', data: undefined });
      }
    });
  }
};

module.exports = {
  create_admin,
  login_admin,
};