/* eslint-disable */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Por favor ingresa tu nombre y apellidos'],
  },
  dateofbirth: {
    type: Date,
    required: [true, 'Por favor ingresa tu fecha de nacimiento'],
  },
  gender: {
    type: String,
    required: [true, 'Por favor ingresa tu género'],
  },
  nationality: {
    type: String,
    required: [true, 'Por favor escoge tu nacionalidad'],
  },
  citizenCardId: {
    type: Number,
    required: [true, 'Por favor ingresa tu numero documento de identidad'],
    unique: [
      true,
      "Ya hay un usuario registrado con ese número de documento de identidad"
    ],
  },
  documentType: {
    type: String,
    required: [true, 'Por favor escoge tu tipo de documento']
  },
  citizenIdIssuedAt: {
    type: Date,
    required: [true, 'Por favor ingresa la fecha de expedición de tu cédula']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa tu email'],
    lowercase: true,
    unique: [true, 'Ya hay un usuario registrado con ese email'],
    validate: [validator.isEmail, 'Por favor ingresa un email válido']
  },
  phoneNumber: {
    type: Number,
    required: [true, 'Por favor ingresa el número de tu móvil'],
    unique: [true, 'Ya hay un usuario registrado con ese número de móvil']
  },
  homeAddress: {
    type: String,
    required: [true, 'Por favor ingresa tu dirección de residencia']
  },
  zipCode: {
    type: Number,
    required: [true, 'Por favor ingresa tu código postal']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'por favor ingresa una contraseña'],
    minlength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'Por favor confirme su contraseña'],
    validate: {
      //This only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Las contraseñas no coinciden',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
});

//Document middleware, it runs before the save() && create()
userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //Delete the password confirm field
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //This points to the current query
  this.find({
    active: {
      $ne: false,
    },
  });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //reset token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;