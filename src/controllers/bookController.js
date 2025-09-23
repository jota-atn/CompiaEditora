import { insertBooks, getAllBooks , deleteBook, updateBook} from '../database/database.js';

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


//DELETAR um livro.
export const deleteBookController = (req, res) => {
    // Pega o ID que vem na URL (ex: /api/books/123)
    const { id } = req.params; 

    deleteBook(id, (err, success) => {
        if (err) return res.status(500).json({ error: err.message });
        // Se 'success' for false, significa que o ID não foi encontrado
        if (!success) return res.status(404).json({ message: 'Livro não encontrado' });
        
        res.status(200).json({ message: 'Livro deletado com sucesso!' });
    });
};

//ATUALIZAR (Editar) um livro.
export const updateBookController = (req, res) => {
    // Pega o ID da URL e os novos dados do corpo da requisição
    const { id } = req.params; 
    const book = req.body; 

    updateBook(id, book, (err, success) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!success) return res.status(404).json({ message: 'Livro não encontrado' });

        res.status(200).json({ message: 'Livro atualizado com sucesso!' });
    });
};