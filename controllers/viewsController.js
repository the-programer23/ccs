/* eslint-disable */
const jwt = require('jsonwebtoken');
const {
  promisify
} = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.alerts = (req, res, next) => {
  const {
    alert,
    name,
    email
  } = req.query;

  if (alert === 'emailConfirmed') {
    res.locals.alert = `Muy bien, ${name}. Gracias por confirmar tu email`;
  }

  if (alert === 'signup') {
    res.locals.alert = `Muy bien, ${name}. ¡Ya te registraste! Ahora verifica la bandeja de entrada de tu e-mail ${email} o en Spam para confirmar tu cuenta`
  }

  next();
};

exports.getHome = (req, res) => {
  res.status(200).render('home', {
    title: 'Inicio',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Registrate en CSS',
  });
};

exports.emailConfirmed = catchAsync(async (req, res, next) => {

  const decoded = await promisify(jwt.verify)(
    req.params.token,
    process.env.JWT_SECRET
  );

  const user = await User.findByIdAndUpdate(decoded.id, {
    emailConfirmed: true,
  });


  const fName = user.fullName.split(' ')[0];

  res.status(200).redirect(`/me/?alert=emailConfirmed&name=${fName}`);
});



exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Ingresa a tu Cuenta',
  });
};

exports.getUserDataForm = (req, res, next) => {
  res.status(200).render('userdataform', {
    title: 'Modificar usuario',
    user: req.user
  })
}

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Tu cuenta',
  });
};

exports.getChat = (req, res) => {
  res.status(200).render('chat', {
    title: 'Chat',
    userName: `${req.user.firstName} ${req.user.lastName}`,
    userPhoto: req.user.photo
  })
}

// exports.getActiveTours = catchAsync(async (req, res, next) => {
//   const tours = await Tour.find();

//   res.status(200).render('activeTours', {
//     title: 'Tours activos',
//     tours,
//   });
// });

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id, {
      name: req.body.name,
      email: req.body.email,
    }, {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Tu cuenta',
    user: updatedUser,
  });
});