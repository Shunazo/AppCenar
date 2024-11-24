const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your.actual.email@gmail.com',
        pass: 'your-16-digit-app-password'  
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendActivationEmail = async (email, token) => {
    const activationLink = `http://localhost:3000/activate/${token}`;
    
    const mailOptions = {
        from: '"AppCenar" <your.actual.email@gmail.com>',
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
};