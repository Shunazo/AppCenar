const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const mailer = {
    async sendActivationEmail(email, token) {
        const activationUrl = `${process.env.APP_URL}/auth/activate/${token}`;
        
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Activa tu cuenta en AppCenar',
            html: `
                <h1>Bienvenido a AppCenar</h1>
                <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                <a href="${activationUrl}">Activar cuenta</a>
            `
        });
    },

    async sendResetPasswordEmail(email, token) {
        const resetUrl = `${process.env.APP_URL}/auth/reset-password/${token}`;
        
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Restablece tu contraseña en AppCenar',
            html: `
                <h1>Restablecimiento de contraseña</h1>
                <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
                <a href="${resetUrl}">Restablecer contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
            `
        });
    }
};

module.exports = mailer;
