const Sequelize = require('sequelize');

const sequelize = new Sequelize('newdb', 'postgres', '1219', {
    host: 'localhost', // Ensure this is correct, or use your actual host address
    dialect: 'postgres',
    port: 5432,
    // Remove SSL configuration completely
    query: { raw: true }
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
