//Adicionar os livros inicias no BD
const { insertBooks } = require('./database');
const booksData = require('./booksData');

// Itera sobre todos os livros e adiciona no banco
booksData.forEach((book) => {
    insertBooks(book, (err, id) => {
        if (err) {
            console.error('Erro ao adicionar livro:', book.title, err);
        } else {
            console.log(`Livro "${book.title}" adicionado com sucesso! ID: ${id}`);
        }
    });
});