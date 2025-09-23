import sqlite3 from 'sqlite3';
//Importando o SQLite pro Node

    //Tenta conectar ao BD, em caso de sucesso chama a função de criar tabelas, em caso de falha retorna erro.
const db = new sqlite3.Database('./src/database/editora.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    }
    else{
        console.log('Conectado ao banco de dados');
        // REMOVEMOS A CHAMADA createTables() DAQUI
    }
});

 
export function createTables(callback) {
    // Exporta a função de criar tabelas no BD
    // Serialize faz rodar em ordem
    db.serialize(() => {
        //Cria a tabela de livros
        db.run(`
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT,
                coverImage TEXT,
                category TEXT,
                rating INTEGER,
                language TEXT,
                description TEXT
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela "books":', err.message);
            else console.log('Tabela "books" verificada/pronta.');
        });

        // Cria a tabela de edições de livros
        // Segunda tabela necessária para seguir as formas normais
        db.run(`
            CREATE TABLE IF NOT EXISTS editions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NOT NULL,
                format TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela "editions":', err.message);
            else console.log('Tabela "editions" verificada/pronta.');
        //Callback para controlar a ordem de execução
            callback?.()
        });
    });
}
// Exportar função para adicionar livro com suas edições
export function insertBooks(book, callback) {
    const queryBook = `
        INSERT INTO books (title, author, coverImage, category, rating, language, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(queryBook, [
        book.title,
        book.author,
        book.coverImage,
        book.category,
        book.rating,
        book.language,
        book.description
    ], function (err) {
        if (err) return callback(err);

        const bookId = this.lastID; // ID do livro recém inserido

        const queryEdition = `
            INSERT INTO editions (book_id, format, price, stock)
            VALUES (?, ?, ?, ?)
        `;

        // Se não houver edições, retorna logo
        if (!book.editions || book.editions.length === 0) {
            return callback(null, bookId);
        }

        let insertedCount = 0;
        const editionsToInsert = book.editions.length;

        book.editions.forEach(ed => {
            db.run(queryEdition, [bookId, ed.format, ed.price, ed.stock], (err) => {
                if (err) {
                    console.error("Erro ao inserir edição:", err);
                
                }

                insertedCount++;
                // Só chama o callback quando todas as edições terminarem
                if (insertedCount === editionsToInsert) {
                    callback(null, bookId);
                }
            });
        });
    });
}


// Função para buscar TODOS os livros com suas edições
export function getAllBooks(callback) {
    db.all(`SELECT * FROM books`, [], (err, books) => {
        if (err) return callback(err);

        let count = 0;
        const result = [];

        if (books.length === 0) return callback(null, result);

        books.forEach(book => {
            db.all(`SELECT format, price, stock FROM editions WHERE book_id = ?`, [book.id], (err, editions) => {
                if (err) return callback(err);

                result.push({ ...book, editions: editions });
                count++;
                if (count === books.length) callback(null, result);
            });
        });
    });
}

 // Deleta um livro do banco de dados.
//Todas as ediçoes sao deletadas
export function deleteBook(id, callback) {
    db.run(`DELETE FROM books WHERE id = ?`, [id], function(err) {
        if (err) {
            return callback(err);
        }
        // this.changes > 0 significa que uma linha foi realmente deletada
        callback(null, this.changes > 0); 
    });
}

/**
 * Atualiza um livro e sua primeira edição.
 * Esta função é feita para funcionar com o seu formulário simples do admin.html,
 * que edita o livro e uma edição (preço, estoque) ao mesmo tempo.
 */
export function updateBook(id, book, callback) {
    const queryBook = `
        UPDATE books 
        SET title = ?, author = ?, coverImage = ?, category = ?, 
            rating = ?, language = ?, description = ?
        WHERE id = ?
    `;
    
    db.run(queryBook, [
        book.title, book.author, book.coverImage, book.category,
        book.rating, book.language, book.description, id
    ], function(err) {
        if (err) {
            return callback(err);
        }
        
        // Se o livro tiver edições para atualizar
        if (book.editions && book.editions.length > 0) {
            const firstEdition = book.editions[0];
            
            // Query para atualizar a *primeira* edição encontrada
            // associada a este livro.
            const queryEditionUpdate = `
                UPDATE editions 
                SET format = ?, price = ?, stock = ?
                WHERE id = (SELECT id FROM editions WHERE book_id = ? LIMIT 1)
            `;
            
            db.run(queryEditionUpdate, [
                firstEdition.format, firstEdition.price, firstEdition.stock, id
            ], (err) => {
                if (err) {
                    return callback(err);
                }
                callback(null, true);
            });
            
        } else {
            // Nenhuma edição para atualizar, mas o livro foi atualizado
            callback(null, true);
        }
    });
}

// Exporta as funções e o objeto db
export default db;

//TODO: Criar a parte de usuários