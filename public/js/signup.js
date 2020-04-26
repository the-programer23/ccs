/* eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import {
    showAlert
} from './alert'

export const signup = async (fullName, dateofbirth, gender, nationality, citizenCardId, documentType, citizenIdIssuedAt, email, phoneNumber, homeAddress, zipCode, password, confirmPassword) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
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
            }
        })


        if (res.data.status === 'success') {
            const firstName = res.data.data.user.fullName.split(' ')[0];
            location.assign(`/me/?alert=signup&name=${firstName}&email=${email}`);

            // showAlert('success', `Muy bien, ${firstName}. ¡Ya te registraste! Ahora verifica la bandeja de entrada de tu e-mail ${email} o en en Spam para confirmar tu cuenta`, 120);
        }

    } catch (err) {
        console.log(err.response.data.message)
        let markup;
        if (err.response.data.message === 'Este número de documento de identidad ya fue registrado') {
            markup = `<div class="input_error">${err.response.data.message}</div>`
            document.querySelector('#citizenCardId').insertAdjacentHTML('afterend', markup)
        }
        if (err.response.data.message === 'Este email ya fue registrado') {
            markup = `<div class="input_error">${err.response.data.message}</div>`
            document.querySelector('#email').insertAdjacentHTML('afterend', markup)
        }
        if (err.response.data.message === 'Este número de móvil ya fue registrado') {
            markup = `<div class="input_error">${err.response.data.message}</div>`
            document.querySelector('#phoneNumber').insertAdjacentHTML('afterend', markup)
        }

        showAlert('error', 'Verifica los campos con texto en rojo');
    }
}