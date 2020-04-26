const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        (this.to = user.email),
        (this.firstName = user.firstName),
        (this.url = url),
        (this.from = `Grupo DailyMoneey <${process.env.EMAIL_FROM}>`);
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    //sends the eactual email
    async send(template, subject) {
        // 1) Render html based on pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url
        });

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        this.send('welcome', 'Bienvenido a la familia de DailyMoneey!');
    }

    async sendPassworReset() {
        this.send('passwordReset', 'Restablecer contraseña')
    }

    async sendPasswordChanged() {
        this.send('passwordChanged', 'La contraseña fue cambiada')
    }

    async sendConfirmEmail() {
        this.send('emailConfirm', 'Confirma tu email')
    }
};