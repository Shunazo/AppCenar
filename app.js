  const express = require('express');
  const session = require('express-session');
  const path = require('path');
  const exphbs = require('express-handlebars');
  const app = express();

  // Session configuration
  app.use(session({
      secret: 'appcenar-secret-key',
      resave: false,
      saveUninitialized: false
  }));

  // Handlebars setup
  app.engine('hbs', exphbs.engine({
      defaultLayout: 'main',
      extname: '.hbs'
  }));
  app.set('view engine', 'hbs');

  // Middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static('public'));

  // Routes
  const authRoutes = require('./routes/auth');
  app.use('/', authRoutes);

  // Home route with role-based redirection
  app.get('/', (req, res) => {
      if (req.session.user) {
          const routes = {
              'cliente': '/cliente/home',
              'delivery': '/delivery/home',
              'comercio': '/comercio/home',
              'admin': '/admin/home'
          };
          res.redirect(routes[req.session.user.role]);
      } else {
          res.render('auth/login');
      }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
  });

  module.exports = app;