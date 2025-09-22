let allBooks = []; //Guardar os livros depois de buscar na API

//Função para buscar e salvar os livros da API
export async function fetchAllBooks() {
    // Se já buscamos antes, apenas retorna os livros guardados
    if (allBooks.length > 0) {
        return allBooks;
    }

    try {
        console.log('Buscando livros da API...');
        const response = await fetch('http://localhost:3000/api/books');
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        allBooks = await response.json();
        console.log('Livros carregados e salvos:', allBooks);
        return allBooks;
    } catch (error) {
        console.error('Falha ao buscar livros da API:', error);
        return []; // Retorna um array vazio em caso de erro
    }
}

//Função para pegar todos os livros (que já foram buscados)
export function getBooks() {
    return allBooks;
}

//Função para pegar um livro específico por ID
export function getBookById(id) {
    // Converte para número para garantir a comparação
    return allBooks.find(book => book.id === Number(id));
}