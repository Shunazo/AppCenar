const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const sessionConfig = {
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './data'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};

module.exports = sessionConfig;
