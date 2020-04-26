import '@babel/polyfill';
import axios from 'axios';
import {
    showAlert
} from './alert';

//type is eather 'contraseña' or 'datos'
export const updateSettings = async (data, type) => {
    try {
        const url =
            type === 'contraseña' ?
            '/api/v1/users/updateMyPassword/' :
            '/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data,
        });

        if (res.data.status === 'success' && type === 'contraseña') {

            showAlert('success', 'Su contraseña se actualizó correctamente', 15);
            $('.center').hide();
            $('#show').show();

        } else if (res.data.status === 'success' && type === 'datos') {
            showAlert('success', 'Sus datos se actualizaron exitosamente', 15);
        }
    } catch (err) {
        if (err.response.data.message === "Invalid input data. Las contraseñas no coinciden") {
            showAlert('error', err.response.data.message.split('.')[1], 5);
        } else {
            showAlert('error', err.response.data.message, 5);
        }

    }
};