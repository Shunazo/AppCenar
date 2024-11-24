const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/database.sqlite'),
    logging: false
});

// Test the connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Unable to connect to the database:', err));

// Sync all models
sequelize.sync({ alter: true })
    .then(() => console.log('Database synchronized'))
    .catch(err => console.error('Error syncing database:', err));
module.exports = sequelize;