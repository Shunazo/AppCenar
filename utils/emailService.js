const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port : 587,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendActivationEmail = async (email, token) => {
    const activationLink = `http://localhost:3000/activate/${token}`;
    
    const mailOptions = {
        from: '"AppCenar Notifications" <no-reply@example.com>',
        to: email,
        subject: 'Activa tu cuenta en AppCenar',
        html: `
            <h1>¡Bienvenido a AppCenar!</h1>
            <p>Para activar tu cuenta, haz click en el siguiente enlace:</p>
            <a href="${activationLink}">Activar mi cuenta</a>
        `
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = {
    sendActivationEmail
}