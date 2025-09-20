const express = require('express');
const path = require('path');

const { db, insertBooks, getAllBooks } = require('./src/database/database.js');

const app = express();

app.use(express.static('public'));
app.use(express.json());

const PORT = 3000;

app.post('/books', (req, res) => {
    const book = req.body;
    insertBooks(book, (err, bookId) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Livro adicionado!', bookId });
    });
});

app.get('/books', (req, res) => {
    getAllBooks((err, livros) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(livros);
    });
});

app.listen(PORT, () => {
     console.log(`Servidor rodadando em http://localhost:${PORT}`);
});
