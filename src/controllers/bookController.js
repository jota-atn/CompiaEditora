const { insertBooks, getAllBooks } = require('../database/database.js');

const listarLivros = (req, res) => {
    getAllBooks((err, livros) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(livros);
    });
};

const adicionarLivro = (req, res) => {
    const book = req.body;
    insertBooks(book, (err, bookId) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Livro adicionado!', bookId });
    });
};

module.exports = {
    listarLivros,
    adicionarLivro,
};