// database/db.js
//ce fichier sépare la logique de connexion à la base de données et exporte connect et getDb
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

function getDb(dbName) {
    return client.db(dbName);
}

module.exports = {
    connect,
    getDb
};
