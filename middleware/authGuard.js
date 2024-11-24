const authGuard = {
    checkRole: (allowedRoles) => {
        return (req, res, next) => {
            if (!req.session.user) {
                return res.redirect('/login');
            }
            
            if (!allowedRoles.includes(req.session.user.role)) {
                return res.status(403).render('errors/403', {
                    message: 'No tienes permisos para acceder a esta sección'
                });
            }
            next();
        };
    },

    validateSession: (req, res, next) => {
        if (req.session.user) {
            res.locals.user = req.session.user;
            res.locals.userRole = req.session.user.role;
        }
        next();
    }
};
