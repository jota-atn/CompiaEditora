const express = require('express');
const path = require('path');
const { db, insertBooks, getAllBooks } = require('./database');
//Importa as funções do BD

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json()); // Permite ler JSON do corpo da requisição

const PORT = 3000;

// Rota para adicionar livro
app.post('/books', (req, res) => {
    const book = req.body;
    insertBooks(book, (err, bookId) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Livro adicionado!', bookId });
    });
});

// Rota para listar livros
app.get('/books', (req, res) => {
    getAllBooks((err, livros) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(livros);
    });
});

app.listen(PORT, () => {
     console.log(`Servidor rodadando em http://localhost:${PORT}`);
});
