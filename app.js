// app.js

const express = require('express');
const exphbs = require('express-handlebars'); // Import pour express-handlebars

const app = express();
const port = process.env.PORT || 3000;

const { connect, getDb } = require('./database/db'); // Import pour le fichier de la BD db.js
connect();

// Middleware necessaire pour faire le parsing du "request body" et y chercher des paramètres
app.use(express.urlencoded({ extended: true }));

// Engin de vues Express-Handlebars
app.engine('hbs', exphbs.engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');

// Middleware pour le JSON
app.use(express.json());

// Require pour les routes du fichier routes.js
require('./routes')(app);

// Démarrage du serveur Express
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
