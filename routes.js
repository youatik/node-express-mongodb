//routes.js

const { connect, getDb } = require('./database/db'); // Importer la BD

module.exports = (app) => {

//route par default
    app.get('/', (req, res) => {
        res.render('home');
    });

// Route pour chercher les 250 permiers documents
    app.get('/books-catalog', async (req, res) => {
        try {
            const db = getDb('A17');
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
                .limit(250)
                .toArray();

            res.render('book-catalog', { books }); // va vers la page 'book-catalog.hbs' comme view template
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

// Route to display the Edit Book form with populated data
    app.get('/edit-book/:isbn', async (req, res) => {
        // This block will handle /edit-book/9780070570641
        handleBookEdit(req, res, req.params.isbn);
    });

    app.get('/edit-book/', async (req, res) => {
        // This block will handle /edit-book/?isbn=9780070570641
        if (!req.query.isbn) {
            res.status(400).send('ISBN not provided');
            return;
        }
        handleBookEdit(req, res, req.query.isbn);
    });



    async function handleBookEdit(req, res, isbn) {
        try {
            const db = getDb('A17');
            const collection = db.collection('Books');

            // Find the book by ISBN (assuming ISBN is unique)
            const book = await collection.findOne({ ean_isbn13: Number(isbn) });

            //test
            console.log(`Looking for book with ISBN: ${isbn}`);
            const booktest = await collection.findOne({ ean_isbn13: Number(isbn) });
            console.log(booktest);

            if (!book) {
                res.status(404).send(`ISBN ${isbn} not found`);
                return;
            }

            res.render('edit-book', { book });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }



// Route to update book data
    app.post('/update-book', async (req, res) => {
        try {
            //logging for debug entry into the code of this post
            console.log('Enter /update-book route');
            console.log('Request body:', req.body);

            const db = getDb('A17');
            const collection = db.collection('Books');

            // Get updated book data from the form submission
            const updatedBookData = {
                title: req.body.title,
                creators: req.body.creators,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                description: req.body.description,
                publisher: req.body.publisher,
                publishDate: req.body.publishDate,
                price: parseFloat(req.body.price),
                length: parseInt(req.body.length, 10),
            };

            // Update the book in the database based on ISBN
            const isbn = req.body.isbn;
            await collection.updateOne({ ean_isbn13: Number(isbn) }, { $set: updatedBookData });

            res.redirect('/books-catalog'); // Redirect to the book catalog after updating

            //logging for debug exit from the code of this post
            console.log('Exit /update-book route');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


// Serve the 'delete-isbn' view
    app.get('/delete-isbn', (req, res) => {
        res.render('delete-isbn');
    });

    app.post('/delete-book', async (req, res) => {
        try {
            const db = getDb('A17');
            const collection = db.collection('Books');

            const isbn = req.body.isbn;
            await collection.deleteOne({ ean_isbn13: Number(isbn) });

            res.redirect('/books-catalog');  // Redirect to the book catalog after deletion

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


    app.get('/create-book', (req, res) => {
        res.render('create-book'); // Render the 'create-book.hbs' view when this endpoint is accessed
    });

    app.post('/create-book', async (req, res) => {
        try {
            console.log('Enter /create-book route');
            console.log('Request body:', req.body);

            const db = getDb('A17');
            const collection = db.collection('Books');

            // Get book data from the form submission
            const newBookData = {
                ean_isbn13: Number(req.body.isbn),
                title: req.body.title,
                creators: req.body.creators,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                description: req.body.description,
                publisher: req.body.publisher,
                publishDate: req.body.publishDate,
                price: parseFloat(req.body.price),
                length: parseInt(req.body.length, 10),
            };

            // Check if ISBN already exists
            const existingBook = await collection.findOne({ ean_isbn13: newBookData.ean_isbn13 });

            if (existingBook) {
                // If the book with the given ISBN already exists, redirect with an error message (or handle as desired)
                res.redirect('/create-book?error=ISBN already exists');
            } else {
                // Insert the new book data into the database
                await collection.insertOne(newBookData);

                res.redirect('/books-catalog'); // Redirect to the book catalog after inserting
            }

            console.log('Exit /create-book route');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

// Route to display the Edit ISBN form
    app.get('/edit-isbn', (req, res) => {
        res.render('edit-isbn');
    });


};