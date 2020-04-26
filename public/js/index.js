import {
  showAlert
} from './alert';

import {
  signup
} from './signup';

import {
  login,
  logout
} from './login';

import {
  updateSettings
} from './updateSettings';


// DOM ELEMENTS
const logInForm = document.querySelector('.form--login');
const loginMiddleware = document.querySelector('.login-middleware');
const logoutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('.form--signup');
const userDataForm = document.querySelector('.form-user-data');
// const createTourForm = document.querySelector('.form-createTour')
const updatePasswordForm = document.querySelector('.form-user-password');
// const bookBtn = document.getElementById('book-tour')

// Delegation


if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const dateofbirth = document.getElementById('dateofbirth').value;
    const gender = document.getElementById('gender').value;
    const nationality = document.getElementById('nationality').value;
    const citizenCardId = document.getElementById('citizenCardId').value;
    const documentType = document.getElementById('documentType').value;
    const citizenIdIssuedAt = document.getElementById('citizenIdIssuedAt')
      .value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const homeAddress = document.getElementById('homeAddress').value;
    const zipCode = document.getElementById('zipCode').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    console.log(
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
    );
    signup(
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
    );
  });
}

if (logInForm) {
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password, 'main');
  });
}

if (loginMiddleware) {
  loginMiddleware.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginMiddlewareEmail').value;
    const password = document.getElementById('loginMiddlewarePassword').value;
    login(email, password, 'middleware');
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('fullName', document.getElementById('fullName').value);
    form.append('email', document.getElementById('email').value);
    form.append('phoneNumber', document.getElementById('phoneNumber').value);
    form.append('homeAddress', document.getElementById('homeAddress').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // this method passes firstName, lastName, email the the rest of the fields values to axios and it put them in req.body for example req.body.name ...
    updateSettings(form, 'datos');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Guardando...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({
        passwordCurrent,
        password,
        passwordConfirm,
      },
      'contraseña'
    );

    document.querySelector('.btn--save-password').textContent =
      'Guardar contraseña';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// the alertMessage variable gets from the body the sattribute data-alert which is base.pug file
const alertMessage = document.querySelector('body').dataset.alert;
console.log(alertMessage)
if (alertMessage) showAlert('success', alertMessage, 10);

// displays the overlap and popups the passwordchage form
$('#show').on('click', function () {
  $('.center').show();
  $(this).hide();
});

$('#close').on('click', function () {
  $('.center').hide();
  $('#show').show();
});

$('#showlogin').on('click', function () {
  $('.login-form-account').show();
  $(this).hide();
});

$('#closelogin').on('click', function () {
  $('.login-form-account').hide();
  $('#showlogin').show();
});

//Preview Image before it is uploaded
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $('#userPhoto').attr('src', e.target.result);
    };

    reader.readAsDataURL(input.files[0]); // convert to base64 string
  }
}

$('#photo').change(function () {
  readURL(this);
  console.log('this');
  console.log(this);
});