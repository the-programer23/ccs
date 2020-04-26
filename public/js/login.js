import '@babel/polyfill';
import axios from 'axios';
import {
  showAlert
} from './alert';


export const login = async (email, password, type) => {
  try {
    const url = type === 'main' ? '/api/v1/users/login' : '/api/v1/users/loginMiddleware'


    const res = await axios({
      method: 'POST',
      url,
      data: {
        email,
        password,
        type
      }
    });

    if (type === 'middleware' && res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/changeData');
      }, 1500);
    }

    if (type === 'main' && res.data.status === 'success') {
      showAlert('success', `Acceso concedido, bienvenido`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};


export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    })
    if (res.data.status === 'success') {
      location.reload(true);
      location.assign('/');
      window.history.forward(1);

    }
  } catch (err) {
    showAlert('error', 'No pude cerrar tu sesión, por favor intenta de nuevo');
  }
}