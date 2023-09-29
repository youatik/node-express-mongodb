//routes.js
//ce fichier contient les routes et leurs controleurs menant aux vues et aux actions
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

            // Recherche sur MongoDB:
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

// Route pour le 'Edit Book' dont le formulaire contient les infos à éditer
    app.get('/edit-book/:isbn', async (req, res) => {
        // This block will handle /edit-book/9780070570641
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

//fonction de la route 'Edit Book'
    async function handleBookEdit(req, res, isbn) {
        try {
            const db = getDb('A17');
            const collection = db.collection('Books');

            // Trouver livre par  ISBN (is le ISBN est unique)
            const book = await collection.findOne({ ean_isbn13: Number(isbn) });

            //logging pour debug
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

// Route pour le 'update book'
    app.post('/update-book', async (req, res) => {
        try {
            //logging pour debug
            console.log('Enter /update-book route');
            console.log('Request body:', req.body);

            const db = getDb('A17');
            const collection = db.collection('Books');

            // données pour le formulaire
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

            // mise à jour sur la base du ISBN
            const isbn = req.body.isbn;
            await collection.updateOne({ ean_isbn13: Number(isbn) }, { $set: updatedBookData });

            res.redirect('/books-catalog'); // Rediriger vers le 'book catalog' après le update

            //logging pour debug
            console.log('Exit /update-book route');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


// Route pour la vue 'delete-isbn'
    app.get('/delete-isbn', (req, res) => {
        res.render('delete-isbn');
    });

    app.post('/delete-book', async (req, res) => {
        try {
            const db = getDb('A17');
            const collection = db.collection('Books');

            const isbn = req.body.isbn;
            await collection.deleteOne({ ean_isbn13: Number(isbn) });

            res.redirect('/books-catalog');  // Rediriger vers le 'book catalog' après delete

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


// Route pour la vue 'create-book'
    app.get('/create-book', (req, res) => {
        res.render('create-book');
    });

    app.post('/create-book', async (req, res) => {
        try {
            console.log('Enter /create-book route');
            console.log('Request body:', req.body);

            const db = getDb('A17');
            const collection = db.collection('Books');

            // Données du formulaire
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

            // Vérifier si le ISBN existe déjà
            const existingBook = await collection.findOne({ ean_isbn13: newBookData.ean_isbn13 });

            if (existingBook) {
                //  Si le ISBN existe déjà afficher message d'erreur
                res.redirect('/create-book?error=ISBN already exists');
            } else {
                // Insertion dans la BD
                await collection.insertOne(newBookData);

                res.redirect('/books-catalog'); // Rediriger vers le 'book catalog' après le insert
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