/* eslint-disable */
// type is 'success' or 'error'
export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
}

// type is success or error, time = 7 where 7 is in seconds and time * 1000 to converti to 
// milliseconds
export const showAlert = (type, msg, time = 7) => {
    hideAlert()
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, time * 1000);
}