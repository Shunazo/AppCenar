const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const initDatabase = () => {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    db.serialize(() => {
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error initializing database:', err);
            } else {
                console.log('Database initialized successfully');
            }
        });
    });
};

module.exports = initDatabase;
