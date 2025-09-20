const sqlite3 = require('sqlite3').verbose();
//Importando o SQLite pro Node, verbose para logs detalhados

const db = new sqlite3.Database('./editora.db', (err) => {
    //Tenta conectar ao BD, em caso de sucesso chama a função de criar tabelas, em caso de falha retorna erro.
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    }
    else{
        console.log('Conectado ao banco de dados')
        createTables();
    }
});

 
function createTables() {
    // Função de criar tabelas no BD
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
            if (err) {
                console.error('Erro ao criar tabela de livros:', err.message);
            } else {
                console.log('Tabela "livros" pronta.');
            }
        });

        // Cria a tabela de edições de livros
        // Segunda tabela necessária para seguir as formas normais
        db.run(`
            CREATE TABLE IF NOT EXISTS editions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NOT NULL,
                format TEXT NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error('Erro ao criar tabela de edições:', err.message);
            } else {
                console.log('Tabela "edicoes" pronta.');
            }
        });
    });
}
// Função para adicionar livro com suas edições
function insertBooks(book, callback) {
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
    ], 
    //Insere os livros formando pro BD
    function(err) {
        if (err) return callback(err);

        const bookId = this.lastID; // ID do livro recém inserido

        const queryEdition = `INSERT INTO editions (book_id, format, price) VALUES (?, ?, ?)`;
        book.editions.forEach(ed => {
            db.run(queryEdition, [bookId, ed.format, ed.price]);
        });
        //insere as edições do livro

        callback(null, bookId);
    });
}

// Função para buscar TODOS os livros com suas edições
function getAllBooks(callback) {
    db.all(`SELECT * FROM books`, [], (err, books) => {
        if (err) return callback(err);

        let count = 0;
        const result = [];

        if (books.length === 0) return callback(null, result);

        books.forEach(book => {
            db.all(`SELECT format, price FROM editions WHERE book_id = ?`, [book.id], (err, editions) => {
                if (err) return callback(err);

                result.push({ ...book, editions: editions });
                count++;
                if (count === books.length) callback(null, result);
            });
        });
    });
}

// Exporta as funções e o objeto db
module.exports = {
    db,
    insertBooks,
    getAllBooks
};

//TODO: Criar mais funções de consulta
//TODO: Exportar livros pro frontend
//TODO: Criar a parte de usuários