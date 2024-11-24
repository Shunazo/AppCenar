const helmet = require('helmet');
const csrf = require('csurf');
const sanitize = require('express-mongo-sanitize');

// Security middleware configuration
const securityConfig = {
    helmet: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com']
            }
        },
        xssFilter: true,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }),
    csrf: csrf({ cookie: true }),
    sanitize: sanitize()
};

module.exports = securityConfig;