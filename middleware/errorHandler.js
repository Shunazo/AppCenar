const logger = require('../utils/logger');

const errorHandler = {
    notFound: (req, res, next) => {
        const error = new Error('Página no encontrada');
        error.status = 404;
        next(error);
    },

    handler: (err, req, res, next) => {
        const status = err.status || 500;
        
        // Log error
        logger.error({
            status,
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
            ip: req.ip
        });

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(status).json({
                error: status === 500 ? 'Error interno del servidor' : err.message
            });
        }

        res.status(status).render('error', {
            title: `Error ${status}`,
            message: status === 500 ? 'Error interno del servidor' : err.message,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
};

module.exports = errorHandler;
