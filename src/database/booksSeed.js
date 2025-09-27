// 1. Importa as funções necessárias
import { insertBooks, createUser, findUserByEmail } from './database.js';
import booksData from './booksData.js';

export function seedDatabase(callback) {
    console.log('Iniciando o preenchimento (seed) do banco de dados...');
    
    // 2. Defina os dados do admin
    const adminUser = {
        name: 'Admin Compia',
        email: 'admin@compia.com',
        password: 'Admin#Compia2025',
        isAdmin: 1 
    };

    const bookTasks = booksData.length;
    let completedTasks = 0;
    let adminTaskCompleted = false;

    // Função que verifica se todas as tarefas (livros e admin) terminaram
    const checkCompletion = () => {
        if (completedTasks === bookTasks && adminTaskCompleted) {
            console.log('Preenchimento (seed) concluído.');
            if (callback) callback();
        }
    };

    // --- Tarefa de Inserir Livros ---
    if (bookTasks === 0) {
        console.log('Nenhum livro para adicionar no seed.');
    } else {
        booksData.forEach((book) => {
            insertBooks(book, (err, id) => {
                if (err) {
                    console.error('Erro ao adicionar livro (seed):', book.title, err.message);
                } else {
                    console.log(`Livro (seed): "${book.title}" adicionado com sucesso!`);
                }
                completedTasks++;
                checkCompletion();
            });
        });
    }

    // --- Tarefa de Inserir Admin ---
    findUserByEmail(adminUser.email, (err, user) => {
        if (err) {
            console.error('Erro ao verificar admin (seed):', err);
            adminTaskCompleted = true;
            checkCompletion();
            return;
        }

        if (!user) { // Se o admin não existe, cria
            createUser(adminUser, (err, newAdmin) => {
                if (err) {
                    console.error('Erro ao criar admin (seed):', err);
                } else {
                    console.log('Usuário Admin criado com sucesso!');
                }
                adminTaskCompleted = true;
                checkCompletion();
            });
        } else { // Se o admin já existe
            console.log('Usuário Admin já existe.');
            adminTaskCompleted = true;
            checkCompletion();
        }
    });

    // Se não houver livros, precisamos checar a conclusão mesmo assim
    if (bookTasks === 0) {
        checkCompletion();
    }
}