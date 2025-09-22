import { insertBooks, getAllBooks } from '../database/database.js';

export const getBooks = (req, res) => {
    getAllBooks((err, livros) => {
        if (err) return res.status(500).json({ error: err.message });
        // Retorna os livros como JSON
        res.json(livros);
    });
};

export const setBooks = (req, res) => {
    const book = req.body; // Pega o livro do corpo da requisição
    insertBooks(book, (err, bookId) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Livro adicionado!', bookId });
    });
};
