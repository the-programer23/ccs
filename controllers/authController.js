/* eslint-disable */
const crypto = require('crypto');
const {
  promisify
} = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchASync = require('../utils/catchAsync');
const Email = require('../utils/mail');

const signToken = (id, expDay) => {
  return jwt.sign({
      id: id,
    },
    process.env.JWT_SECRET, {
      expiresIn: expDay,
    }
  );
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id, process.env.JWT_EXPIRES_IN);

  const cookieOptions = {
    // Milliseconds when the user was created + x Milliseconds (90 days in this case)
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  //Remove the user password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status('200').json({
    status: 'success',
  });
};

exports.signup = catchASync(async (req, res, next) => {

  const {
    fullName,
    dateofbirth,
    gender,
    nationality,
    citizenCardId,
    documentType,
    citizenIdIssuedAt,
    email,
    phoneNumber,
    homeAddress,
    zipCode,
    password,
    confirmPassword
  } = req.body;

  const newUser = await User.create({
    fullName,
    dateofbirth,
    gender,
    nationality,
    citizenCardId,
    documentType,
    citizenIdIssuedAt,
    email,
    phoneNumber,
    homeAddress,
    zipCode,
    password,
    confirmPassword
  });

  // const url = `${req.protocol}://${req.get('host')}/`
  const emailToken = signToken(newUser._id, '3d');
  const url = `${req.protocol}://${req.get(
    'host'
  )}/emailConfirmed/${emailToken}`;

  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, req, res);
});

// This function renders pages only, it's not for errors
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) Verify Token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }
      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //There is a logged in user
      //With this code the .pug files will have access to the user data
      res.locals.user = currentUser;
      req.user = currentUser;

      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.login = catchASync(async (req, res, next) => {
  const {
    email,
    password,
    type
  } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Por favor ingresa un email y una contraseña'),
      400
    );
  }

  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email o contraseña invalido', 401));
  }
  if (type === 'middleware') {
    const token = signToken(user._id, 300);

    const cookieOptions = {
      // Milliseconds when the user was created + x Milliseconds (90 days in this case)
      expires: new Date(
        Date.now() + 60000
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    };

    res.cookie('jwt2', token, cookieOptions);

    user.password = undefined;

    res.locals.user = user;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    })
  } else if (type === 'main') {
    createSendToken(user, 200, req, res);
  }

});



exports.protectfor1min = catchASync(async (req, res, next) => {
  // 1. Get the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    //this gets the jbt from the browser cookie
  } else if (req.cookies.jwt2) {
    token = req.cookies.jwt2;
  }

  if (!token) {
    return res.redirect('/me')
  }
  // 2. Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('Este usuario ya no existe', 401));
  }
  // 4. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Su contraseña fue cambiada recientemente, por favor intenta de nuevo',
        401
      )
    );
  }

  //Grant acces to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.protect = catchASync(async (req, res, next) => {
  // 1. Get the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    //this gets the jbt from the browser cookie
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'No has iniciado sesión. Inicia sesión para obtener acceso',
        401
      )
    );
  }
  // 2. Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('Este usuario ya no existe', 401));
  }
  // 4. Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Su contraseña fue cambiada recientemente, por favor intenta de nuevo',
        401
      )
    );
  }

  //Grant acces to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles=['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tienes permiso para realizar esta acción', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchASync(async (req, res, next) => {
  //1. Get user based on POSTed email
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new AppError('No hay un usuario con ese email', 404));
  }
  //2. Generate the random reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false,
  });

  // 3) Send URL token to the user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPassworReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch {
    (user.passwordResetToken = undefined),
    (user.passwordResetExpires = undefined);
    await user.save({
      validateBeforeSave: false,
    });

    return next(
      new AppError(
        'Hubo un error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde'
      ),
      500
    );
  }
});

exports.resetPassword = catchASync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });
  //2) If the token has not expired and there is a new, set a new password
  if (!user) {
    return next(new AppError('El token es invalido o ha expirado', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //3) Log User in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchASync(async (req, res, next) => {
  //1)Get user from collection
  // console.log(req.user, ' & ', req.user._id);
  const user = await User.findById(req.user._id).select('+password');

  //2)Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Contraseña incorrecta', 401));
  }

  //3)If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.passwordConfirm;

  await user.save();
  await new Email(user).sendPasswordChanged();
  //4)Log user in, send jwt
  createSendToken(user, 200, req, res);
});