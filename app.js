//app.js
const express = require('express');
//const { MongoClient } = require('mongodb'); // Import pour MongoClient du package mongodb
const exphbs = require('express-handlebars'); // Import pour express-handlebars

const app = express();
const port = process.env.PORT || 3000;

const { connect, getDb } = require('./database/db'); // Importing the database utilities
connect();

// Middleware necessaire pour faire le parsing du "request body"
app.use(express.urlencoded({ extended: true }));

//Engin de vues Express Handlebars
app.engine('hbs', exphbs.engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');

// Middleware pour le JSON
app.use(express.json());

// Require and use the routes from routes.js
require('./routes')(app);

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
