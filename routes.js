//routes.js
//ce fichier contient les routes et leurs controleurs menant aux vues et aux actions
const { connect, getDb } = require('./database/db'); // Importer la BD

const axios = require('axios'); // Make sure to install this package.
const PROXY_PORT = 5002
const PROXY_API_URL = `http://localhost:${PROXY_PORT}`; // replace [PROXY_PORT] with the actual proxy port from your config.

module.exports = (app) => {

//route par default
    app.get('/', (req, res) => {
        res.render('home');
    });

// Route pour chercher les documents
    app.get('/books-catalog', async (req, res) => {
        try {

            const response = await axios.get(`${PROXY_API_URL}/books`, {
                headers: {

                }
            });

            // Attends la response du data
            const books = response.data;

            res.render('book-catalog', { books });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


// Route pour le 'Edit Book' dont le formulaire contient les infos à éditer
    app.get('/edit-book/:isbn', async (req, res) => {
        // Ce bloc va handler /edit-book/9780070570641
        handleBookEdit(req, res, req.params.isbn);
    });

    app.get('/edit-book/', async (req, res) => {
        // Ce bloc permet de gérer la route /edit-book/?isbn=9780070570641 etc...
        if (!req.query.isbn) {
            res.status(400).send('ISBN not provided');
            return;
        }
        handleBookEdit(req, res, req.query.isbn);
    });

    async function handleBookEdit(req, res, isbn) {
        try {
            // Fetch the book data from the Flask API
            const response = await axios.get(`${PROXY_API_URL}/books/isbn/${isbn}`);

            // Check si l'API retourne une erreur (e.g. book not found)
            if (response.data.error) {
                res.status(404).send(response.data.error);
                return;
            }

            // Get le book data de l'API response
            const book = response.data;

            //logging pour debug
            console.log(`Looking for book with ISBN: ${isbn}`);
            console.log(book);

            res.render('edit-book', { book });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }


    app.post('/update-book', async (req, res) => {
        try {
            console.log('Enter /update-book route');
            console.log('Request body:', req.body);

            // Processe le data pour matcher le format Flask API
            const updatedBookData = {
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

            // Envoie le data au Flask API avec axios
            const isbn = req.body.isbn;
            const response = await axios.put(`${PROXY_API_URL}/books/isbn/${isbn}`, updatedBookData);

            // Handle la response de Flask API
            if (response.data.error) {
                res.redirect('/update-book?error=' + encodeURIComponent(response.data.error));
            } else {
                res.redirect('/books-catalog'); // Redirecte au 'book catalog' apres updating
            }

            console.log('Exit /update-book route');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


//(VIEW) Route pour la vue 'delete-isbn'
    app.get('/delete-isbn', (req, res) => {
        res.render('delete-isbn');
    });

    app.post('/delete-book', async (req, res) => {
        try {
            const isbn = req.body.isbn;

            // Fait un DELETE request au Flask API
            const response = await axios.delete(`${PROXY_API_URL}/books/isbn/${isbn}`);

            // Check si le Flask API retourne une error
            if (response.data.error) {
                res.status(400).send(response.data.error);
                return;
            }

            res.redirect('/books-catalog');  // Redirecte au 'book catalog' apres deletion

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


// (VIEW) Route pour la vue 'create-book'
    app.get('/create-book', (req, res) => {
        res.render('create-book');
    });

    const axios = require('axios');

// (REST) Route vers API REST
    app.post('/create-book', async (req, res) => {
        try {
            console.log('Enter /create-book route');
            console.log('Request body:', req.body);

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

            // Envoie le data au Flask API
            const response = await axios.post(`${PROXY_API_URL}/books`, newBookData);

            // success OU error
            if (response.data.error) {
                res.redirect('/create-book?error=' + encodeURIComponent(response.data.error));
            } else {
                res.redirect('/books-catalog'); // Redirect au 'book catalog' apres insertion
            }

            console.log('Exit /create-book route');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


// Route to pour la vue du 'Edit ISBN'
    app.get('/edit-isbn', (req, res) => {
        res.render('edit-isbn');
    });

};