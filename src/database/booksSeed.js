
import { faker } from '@faker-js/faker/locale/pt_BR';
import { insertBooks, createUser, findUserByEmail, getAllBooks, createOrder } from './database.js';
import booksData from './booksData.js';

// --- FUNÇÕES HELPER PARA GERAR DADOS ALEATÓRIOS ---

/**
 * Gera um objeto de usuário com dados aleatórios.
 */
function generateRandomUser() {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'Password123', // Senha padrão para todos os usuários de teste
        phone: faker.phone.number(),
        birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
        cpf: faker.string.numeric(11),
        isAdmin: 0
    };
}

/**
 * Gera um objeto de pedido aleatório para um usuário, usando uma lista de livros disponíveis.
 */
function generateRandomOrder(userId, availableBooks) {
    const itemsInOrder = faker.number.int({ min: 1, max: 3 });
    const orderItems = [];
    let totalPrice = 0;

    for (let i = 0; i < itemsInOrder; i++) {
        const randomBook = faker.helpers.arrayElement(availableBooks);
        const randomEdition = faker.helpers.arrayElement(randomBook.editions);
        
        orderItems.push({
            title: randomBook.title,
            format: randomEdition.format,
            price: randomEdition.price,
            quantity: 1, // Para simplificar, cada item tem quantidade 1
            coverImage: randomBook.coverImage
        });
        totalPrice += randomEdition.price;
    }

    return {
        addressId: null, // Simplificando sem endereço para o seed
        totalPrice: totalPrice,
        items: orderItems,
        orderDate: faker.date.past({ years: 1 }).toISOString()
    };
}


/**
 * Função principal que cria os usuários e pedidos aleatórios.
 */
function seedRandomData(finalCallback) {
    console.log('Iniciando o preenchimento (seed) com dados aleatórios...');
    
    // 1. Busca os livros que já foram inseridos no banco
    getAllBooks((err, seededBooks) => {
        if (err || seededBooks.length === 0) {
            console.error('Não foi possível buscar os livros para o seed aleatório. Abortando.', err);
            return finalCallback();
        }

        const NUM_USERS = 5; // Quantidade de usuários aleatórios a serem criados
        let usersProcessed = 0;

        // 2. Cria X usuários aleatórios
        for (let i = 0; i < NUM_USERS; i++) {
            const randomUser = generateRandomUser();
            
            createUser(randomUser, (err, newUser) => {
                if (err) {
                    console.error('Erro ao criar usuário aleatório (seed):', err);
                    usersProcessed++;
                    if (usersProcessed === NUM_USERS) finalCallback();
                    return;
                }
                
                console.log(`Usuário aleatório (seed): "${randomUser.name}" criado.`);
                
                // 3. Para cada usuário, cria de 1 a 3 pedidos aleatórios
                const numOrders = faker.number.int({ min: 1, max: 3 });
                let ordersProcessed = 0;

                if (numOrders === 0) {
                    usersProcessed++;
                    if (usersProcessed === NUM_USERS) finalCallback();
                    return;
                }

                for (let j = 0; j < numOrders; j++) {
                    const randomOrder = generateRandomOrder(newUser.id, seededBooks);
                    createOrder(newUser.id, randomOrder, (err, newOrder) => {
                        if (err) {
                            console.error('Erro ao criar pedido aleatório (seed):', err);
                        } else {
                            console.log(`Pedido aleatório (ID: ${newOrder.id}) criado para ${randomUser.name}.`);
                        }

                        ordersProcessed++;
                        if (ordersProcessed === numOrders) {
                            usersProcessed++;
                            if (usersProcessed === NUM_USERS) finalCallback();
                        }
                    });
                }
            });
        }
    });
}


/**
 * Função principal de seed, agora com opção para dados aleatórios.
 */
export function seedDatabase(options, callback) {
    console.log('Iniciando o preenchimento (seed) do banco de dados...');
    
    const adminUser = {
        name: 'Admin Compia',
        email: 'admin@compia.com',
        password: 'Admin#Compia2025',
        isAdmin: 1
    };

    let bookTasksCompleted = 0;
    const totalBookTasks = booksData.length;
    let adminTaskCompleted = false;

    // Função que verifica se as tarefas iniciais (livros e admin) terminaram
    const checkInitialCompletion = () => {
        if (bookTasksCompleted === totalBookTasks && adminTaskCompleted) {
            console.log('Preenchimento inicial (seed) concluído.');
            
            // Se a opção de criar dados aleatórios estiver ativa, chama a função correspondente
            if (options.createRandomData) {
                seedRandomData(callback);
            } else {
                if (callback) callback();
            }
        }
    };

    // --- Tarefa de Inserir Livros ---
    booksData.forEach((book) => {
        insertBooks(book, (err) => {
            if (err) {
                console.error('Erro ao adicionar livro (seed):', book.title, err.message);
            } else {
                console.log(`Livro (seed): "${book.title}" adicionado com sucesso!`);
            }
            bookTasksCompleted++;
            checkInitialCompletion();
        });
    });

    // --- Tarefa de Inserir Admin ---
    findUserByEmail(adminUser.email, (err, user) => {
        if (err) {
            console.error('Erro ao verificar admin (seed):', err);
            adminTaskCompleted = true;
            checkInitialCompletion();
            return;
        }

        if (!user) {
            createUser(adminUser, (err) => {
                if (err) console.error('Erro ao criar admin (seed):', err);
                else console.log('Usuário Admin criado com sucesso!');
                adminTaskCompleted = true;
                checkInitialCompletion();
            });
        } else {
            console.log('Usuário Admin já existe.');
            adminTaskCompleted = true;
            checkInitialCompletion();
        }
    });
}