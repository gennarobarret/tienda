'use strict';

var Admin = require('../models/admin');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');


// REGISTRO ADMINISTRADOR
const registro_admin = async function (req, res) {

  var data = req.body;
  var admin_arr = [];

  admin_arr = await Admin.find({ email: data.email });

  if (admin_arr.length == 0) {
    // REGISTRO
    if (data.password) {
      bcrypt.hash(data.password, null, null, async function (err, hash) {
        if (hash) {
          data.password = hash;
          var reg = await Admin.create(data);
          res.status(200).send({ data: reg });
        } else {
          res.status(200).send({ message: 'ErrorServer', data: undefined });
        }
      })
    } else {
      res.status(200).send({ message: 'No hay una contraseña', data: undefined });
    }

  } else {
    res.status(200).send({ message: 'El correo ya existe en la base de datos', data: undefined });
  }
}

// LOGIN ADMINISTRADOR
const login_admin = async function (req, res) {
  var data = req.body;
  var admin_arr = [];

  admin_arr = await Admin.find({ email: data.email });

  if (admin_arr.length == 0) {
    res
      .status(200)
      .send({ message: 'No se encontro el correo', data: undefined });
  } else {
    // LOGIN
    let user = admin_arr[0];
    bcrypt.compare(data.password, user.password, async function (error, check) {
      if (check) {
        res.status(200).send({ data: user, token: jwt.createToken(user) });
      } else {
        res
          .status(200)
          .send({ message: 'la contraseña no coincide', data: undefined });
      }
    });
  }
};



module.exports = {
  registro_admin,
  login_admin,
};


// 'use strict';

// const Admin = require('../models/admin');
// const bcrypt = require('bcrypt-nodejs');
// const jwt = require('../helpers/jwt');

// const registro_admin = async function (req, res) {
//   try {
//     const data = req.body;
//     const adminExists = await Admin.find({ email: data.email });

//     if (adminExists.length === 0) {
//       if (data.password) {
//         const hash = await bcrypt.hashSync(data.password);
//         data.password = hash;
//         const newAdmin = await Admin.create(data);
//         res.status(200).send({ data: newAdmin });
//       } else {
//         res.status(400).send({ message: 'No password provided', data: undefined });
//       }
//     } else {
//       res.status(400).send({ message: 'Email already exists in the database', data: undefined });
//     }
//   } catch (error) {
//     res.status(500).send({ message: 'Internal Server Error', data: undefined });
//   }
// };

// const login_admin = async function (req, res) {
//   try {
//     const data = req.body;
//     const admin = await Admin.findOne({ email: data.email });

//     if (!admin) {
//       res.status(400).send({ message: 'Email not found', data: undefined });
//     } else {
//       const passwordMatch = await bcrypt.compare(data.password, admin.password);
//       if (passwordMatch) {
//         const token = jwt.createToken(admin);
//         res.status(200).send({ data: admin, token });
//       } else {
//         res.status(400).send({ message: 'Incorrect password', data: undefined });
//       }
//     }
//   } catch (error) {
//     res.status(500).send({ message: 'Internal Server Error', data: undefined });
//   }
// };

// module.exports = {
//   registro_admin,
//   login_admin,
// };
