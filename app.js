const express = require('express');
const { MongoClient } = require('mongodb'); // Import MongoClient from the mongodb package
const exphbs = require('express-handlebars'); // Import express-handlebars


const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection setup (replace with your database connection URI)
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.engine('hbs', exphbs.engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');

client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Middleware
app.use(express.json());

// Route to retrieve the first 10 documents
app.get('/books-catalog', async (req, res) => {
    try {
        const db = client.db('A17');
        const collection = db.collection('Books');

        // Adjust this query according to your needs:
        const books = await collection.find({})
            .project({
                _id: 0,
                ean_isbn13: 1,
                title: 1,
                creators: 1,
                description: 1,
                publisher: 1,
                publishDate: 1,
                price: 1,
                length: 1
            })
            .limit(10)
            .toArray();

        res.render('book-catalog', { books }); // Assumes you have a 'book-catalog.hbs' view template
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});







// Route to retrieve the first 10 documents based on the "year" field
app.get('/books', async (req, res) => {
    try {
        const db = client.db('A17');
        const collection = db.collection('Livres');

        // Retrieve articles with "title" and "type" (genre) fields
        const books = await collection.find({ type: 'Article' })
            .project({ _id: 0, title: 1, type: 1 }) // Include only "title" and "type"
            .sort({ year: 1 })
            .limit(10)
            .toArray();

        // Render the 'books' view and pass the 'books' data to the template
        res.render('books', { books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
