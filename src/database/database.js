import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
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

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                phone TEXT,
                birthDate TEXT,
                cpf TEXT UNIQUE,
                profilePicture TEXT,
                isAdmin INTEGER DEFAULT 0
            )
        `, (err) => {
            if (err) {
                console.error('Erro ao criar tabela "users":', err.message);
            } else {
                console.log('Tabela "users" verificada/pronta.');
            }
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS addresses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                street TEXT NOT NULL,
                city TEXT NOT NULL,
                cep TEXT NOT NULL,
                is_default INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela "addresses":', err.message);
            else console.log('Tabela "addresses" verificada/pronta.');
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
         db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                address_id INTEGER,
                total_price REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'Processando',
                order_date TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela "orders":', err.message);
            else console.log('Tabela "orders" verificada/pronta.');
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                book_title TEXT NOT NULL,
                format TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                cover_image TEXT,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela "order_items":', err.message);
            else console.log('Tabela "order_items" verificada/pronta.');
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


export function createUser(user, callback) {
    // Criptografa a senha com bcrypt antes de salvar
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return callback(err);

        // Query que insere todos os campos
            const query = `
            INSERT INTO users (name, email, password, phone, birthDate, cpf, profilePicture, isAdmin) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Passa todos os dados do objeto 'user'
         db.run(query, [
            user.name, 
            user.email, 
            hash, 
            user.phone, 
            user.birthDate, 
            user.cpf, 
            user.profilePicture,
            user.isAdmin || 0
        ], function(err) {
            if (err) return callback(err);
            // Retorna o ID do novo usuário criado
            callback(null, { id: this.lastID });
        });
    });
}

export function findUserByEmail(email, callback) {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        callback(err, user);
    });
}

/**
 * Busca um usuário pelo ID, mas sem retornar a senha.
 * Útil para buscar os dados do perfil do usuário logado.
 */
export function findUserById(id, callback) {
    // Exceto a senha, por segurança.
    const query = `
        SELECT *
        FROM users 
        WHERE id = ?
    `;
    db.get(query, [id], (err, user) => {
        callback(err, user);
    });
}

/**
 * Atualiza os dados de um usuário no banco de forma dinâmica.
 * Esta função   só atualiza os campos que são enviados.
 */
export function updateUser(id, userData, callback) {
    // Lista de campos que permitimos que sejam atualizados
    const allowedFields = ['name', 'email', 'phone', 'birthDate', 'cpf', 'profilePicture'];
    
    const fieldsToUpdate = [];
    const values = [];

    // Itera sobre os campos permitidos
    allowedFields.forEach(field => {
        // Se o dado enviado (userData) contém um dos campos permitidos...
        if (userData[field] !== undefined) {
            // Adiciona "nome_do_campo = ?" à nossa query
            fieldsToUpdate.push(`${field} = ?`);
            // Adiciona o valor correspondente ao array de valores
            values.push(userData[field]);
        }
    });

    // Se nenhum campo válido foi enviado, não há nada a fazer.
    if (fieldsToUpdate.length === 0) {
        return callback(null, true); // Retorna sucesso, pois não havia nada para dar errado.
    }

    // Adiciona o ID do usuário ao final do array de valores para a cláusula WHERE
    values.push(id);

    // Monta a query final. Ex: UPDATE users SET name = ?, phone = ? WHERE id = ?
    const query = `
        UPDATE users 
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = ?
    `;
    
    db.run(query, values, function(err) {
        if (err) {
            // Isso vai pegar erros de CPF/Email duplicado
            return callback(err);
        }
        callback(null, this.changes > 0);
    });
}

/**
 * Deleta um usuário do banco de dados.
 */
export function deleteUser(id, callback) {
    const query = `DELETE FROM users WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) return callback(err);
        // Retorna true se uma linha foi deletada
        callback(null, this.changes > 0);
    });
}

/**
 * Busca todos os endereços de um usuário específico.
 */
export function findAddressesByUserId(userId, callback) {
    const query = `SELECT id, street, city, cep, is_default as "default" FROM addresses WHERE user_id = ?`;
    db.all(query, [userId], (err, rows) => {
        callback(err, rows);
    });
}

/**
 * Adiciona um novo endereço para um usuário.
 */
export function addAddress(userId, addressData, callback) {
    const query = `INSERT INTO addresses (user_id, street, city, cep, is_default) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [userId, addressData.street, addressData.city, addressData.cep, addressData.default ? 1 : 0], function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID });
    });
}

/**
 * Atualiza um endereço existente.
 */
export function updateAddress(addressId, addressData, callback) {
    const query = `UPDATE addresses SET street = ?, city = ?, cep = ?, is_default = ? WHERE id = ?`;
    db.run(query, [addressData.street, addressData.city, addressData.cep, addressData.default ? 1 : 0, addressId], function(err) {
        if (err) return callback(err);
        callback(null, this.changes > 0);
    });
}

/**
 * Deleta um endereço.
 */
export function deleteAddress(addressId, callback) {
    const query = `DELETE FROM addresses WHERE id = ?`;
    db.run(query, [addressId], function(err) {
        if (err) return callback(err);
        callback(null, this.changes > 0);
    });
}

/**
 * Cria um novo pedido com seus itens no banco de dados.
 */
export function createOrder(userId, orderData, callback) {
    const { addressId, totalPrice, items, orderDate } = orderData;
    
    const orderQuery = `INSERT INTO orders (user_id, address_id, total_price, order_date) VALUES (?, ?, ?, ?)`;

    db.run(orderQuery, [userId, addressId, totalPrice, orderDate], function(err) {
        if (err) return callback(err);
        
        const orderId = this.lastID;
        const itemQuery = `INSERT INTO order_items (order_id, book_title, format, quantity, price, cover_image) VALUES (?, ?, ?, ?, ?, ?)`;
        
        let itemsToInsert = items.length;
        let insertedCount = 0;
        
        items.forEach(item => {
            db.run(itemQuery, [
                orderId,
                item.title,
                item.format,
                item.quantity,
                item.price,
                item.coverImage
            ], (err) => {
                if (err) console.error('Erro ao inserir item do pedido:', err);
                
                insertedCount++;
                if (insertedCount === itemsToInsert) {
                    callback(null, { id: orderId });
                }
            });
        });
    });
}

/**
 * Busca todos os pedidos de um usuário, incluindo os itens de cada pedido.
 */
export function findOrdersByUserId(userId, callback) {
    const query = `SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC`;
    db.all(query, [userId], (err, orders) => {
        if (err) return callback(err);
        if (orders.length === 0) return callback(null, []);

        let ordersProcessed = 0;
        orders.forEach(order => {
            const itemsQuery = `SELECT * FROM order_items WHERE order_id = ?`;
            db.all(itemsQuery, [order.id], (err, items) => {
                if (err) return callback(err); // Em um caso real, trataríamos o erro melhor
                order.items = items;
                ordersProcessed++;
                if (ordersProcessed === orders.length) {
                    callback(null, orders);
                }
            });
        });
    });
}

export function getAllUsers(callback) {
    // Seleciona todos os campos, exceto a senha (password) por segurança.
    const query = `
        SELECT id, name, email, phone, birthDate, cpf, profilePicture, isAdmin 
        FROM users
    `;
    db.all(query, [], (err, users) => {
        callback(err, users);
    });
}

/**
 * Busca TODOS os pedidos do banco, juntando o nome do cliente e os itens.
 * Ideal para a listagem no painel de admin.
 */
export function getAllOrders(callback) {
    const query = `
        SELECT 
            o.id, 
            o.total_price, 
            o.status, 
            o.order_date,
            -- Usa COALESCE para evitar erro se o usuário for deletado
            COALESCE(u.name, 'Usuário Removido') as userName,
            COALESCE(u.email, '-') as userEmail
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.order_date DESC
    `;
    db.all(query, [], (err, orders) => {
        if (err) {
            console.error("Erro na query principal de getAllOrders:", err);
            return callback(err);
        }
        if (orders.length === 0) {
            return callback(null, []);
        }

        let ordersProcessed = 0;
        orders.forEach(order => {
            const itemsQuery = `SELECT * FROM order_items WHERE order_id = ?`;
            db.all(itemsQuery, [order.id], (err, items) => {
                if (err) {
                     console.error(`Erro ao buscar itens para o pedido ID ${order.id}:`, err);
                    return callback(err);
                }
                order.items = items;
                ordersProcessed++;
                if (ordersProcessed === orders.length) {
                    callback(null, orders);
                }
            });
        });
    });
}
// Exporta as funções e o objeto db
export default db;