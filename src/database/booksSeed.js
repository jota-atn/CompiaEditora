//Adicionar os livros inicias no BD

import { insertBooks } from './database.js';
import booksData from './booksData.js';

//Exporta a função de seed
export function seedDatabase(callback) {
    console.log('Iniciando o preenchimento (seed) do banco de dados...');
    
    let booksToInsert = booksData.length;
    let insertedCount = 0;

    if (booksToInsert === 0) {
        console.log('Nenhum livro para adicionar.');
        if (callback) callback();
        return;
    }

    // Itera sobre todos os livros e adiciona no banco
    booksData.forEach((book) => {
        insertBooks(book, (err, id) => {
            if (err) {
                console.error('Erro ao adicionar livro:', book.title, err.message);
            } else {
                console.log(`Livro "${book.title}" adicionado com sucesso! ID: ${id}`);
            }
            
            insertedCount++;
            // Quando o último livro for processado, chama o callback
            if (insertedCount === booksToInsert) {
                console.log('Preenchimento (seed) concluído.');
                if (callback) callback();
            }
        });
    });
}