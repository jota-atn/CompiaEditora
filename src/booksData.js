//Livros para preencher o BD
const booksData = [
    {
        title: 'Deep Learning: Fundamentos e Aplicações',
        author: 'Dr. Ana Silva',
        coverImage: 'https://m.media-amazon.com/images/I/A10G+oKN3LL._UF894,1000_QL80_.jpg',
        category: 'IA',
        rating: 5,
        language: 'Português',
        description: 'Uma introdução abrangente aos conceitos de Deep Learning, desde redes neurais básicas até arquiteturas avançadas, com exemplos práticos.',
        editions: [
            { format: 'Capa Comum', price: 89.90 },
            { format: 'E-book', price: 59.90 }
        ]
    },
    {
        title: 'Python Avançado para Ciência de Dados',
        author: 'Prof. Carlos Santos',
        coverImage: 'https://m.media-amazon.com/images/I/91DGHmkQmjL._SL1500_.jpg',
        category: 'Programação',
        rating: 4,
        language: 'Português',
        description: 'Explore técnicas avançadas de Python para manipulação de dados, otimização de performance e implementação de algoritmos complexos.',
        editions: [
            { format: 'Capa Dura', price: 109.90 },
            { format: 'E-book', price: 79.90 }
        ]
    },
    {
        title: 'Ethical Hacking: Segurança Ofensiva',
        author: 'Dra. Maria Oliveira',
        coverImage: 'https://m.media-amazon.com/images/I/91LldWCllgS._SL1500_.jpg',
        category: 'Cibersegurança',
        rating: 5,
        language: 'Inglês',
        description: 'Aprenda as ferramentas e metodologias usadas por hackers éticos para identificar e corrigir vulnerabilidades em sistemas e redes.',
        editions: [
            { format: 'Capa Comum', price: 94.90 },
            { format: 'E-book', price: 64.90 }
        ]
    },
    {
        title: 'Blockchain: Tecnologia e Aplicações',
        author: 'Dr. João Pereira',
        coverImage: 'https://m.media-amazon.com/images/I/61NqNm55lhL._SL1000_.jpg',
        category: 'Cibersegurança',
        rating: 3,
        language: 'Português',
        description: 'Desvende a tecnologia por trás das criptomoedas e explore suas aplicações em contratos inteligentes, finanças e muito mais.',
        editions: [
            { format: 'Capa Dura', price: 115.00 },
            { format: 'Capa Comum', price: 84.90 },
            { format: 'E-book', price: 54.90 }
        ]
    },
    {
        title: 'Estruturas de Dados com JavaScript',
        author: 'Fernanda Costa',
        coverImage: 'https://m.media-amazon.com/images/I/71KGa1y8eaL.jpg',
        category: 'Programação',
        rating: 4,
        language: 'Português',
        description: 'Domine a implementação de estruturas de dados essenciais como listas, pilhas, filas e árvores usando a linguagem JavaScript.',
        editions: [
            { format: 'Capa Comum', price: 68.50 },
            { format: 'E-book', price: 45.50 }
        ]
    },
    {
        title: 'Inteligência Artificial: Uma Abordagem Moderna',
        author: 'Russell & Norvig',
        coverImage: 'https://m.media-amazon.com/images/I/81Sc7DUiVmL.jpg',
        category: 'IA',
        rating: 5,
        language: 'Inglês',
        description: 'O livro definitivo sobre Inteligência Artificial, cobrindo desde a teoria fundamental até os avanços mais recentes na área.',
        editions: [
            { format: 'Capa Dura', price: 189.90 },
            { format: 'Capa Comum', price: 159.90 },
        ]
    },
    {
        title: 'Redes de Computadores e a Internet',
        author: 'Kurose & Ross',
        coverImage: 'https://m.media-amazon.com/images/I/91huSJr6BML._UF894,1000_QL80_.jpg',
        category: 'Redes',
        rating: 4,
        language: 'Português',
        description: 'Uma abordagem top-down que ensina os princípios de redes de computadores através de camadas, com foco na internet.',
        editions: [
            { format: 'Capa Dura', price: 165.00 },
            { format: 'Capa Comum', price: 135.00 },
            { format: 'E-book', price: 95.00 }
        ]
    },
    {
        title: 'Arquitetura Limpa: O Guia do Artesão',
        author: 'Robert C. Martin',
        coverImage: 'https://m.media-amazon.com/images/I/815d9tE7jSL.jpg',
        category: 'Engenharia de Software',
        rating: 5,
        language: 'Inglês',
        description: 'Aprenda a construir softwares robustos, flexíveis e fáceis de manter com os princípios universais de arquitetura de software.',
        editions: [
            { format: 'Capa Comum', price: 75.90 },
            { format: 'E-book', price: 49.90 }
        ]
    },
    {
        title: 'Livro Teste A - Apenas E-book',
        author: 'Autor Teste',
        coverImage: 'https://m.media-amazon.com/images/I/815d9tE7jSL.jpg',
        category: 'IA',
        rating: 3,
        language: 'Português',
        description: 'Este é um livro de teste para verificar a funcionalidade do formato E-book.',
        editions: [
            { format: 'E-book', price: 29.90 }
        ]
    },
    {
        title: 'Livro Teste B - Todos os Formatos',
        author: 'Autor Teste',
        coverImage: 'https://m.media-amazon.com/images/I/815d9tE7jSL.jpg',
        category: 'IA',
        rating: 2,
        language: 'Inglês',
        description: 'Este é um livro de teste para verificar a funcionalidade de todos os formatos disponíveis.',
        editions: [
            { format: 'Capa Dura', price: 129.90 },
            { format: 'Capa Comum', price: 99.90 },
            { format: 'E-book', price: 69.90 }
        ]
    },
    {
        title: 'Livro Teste C - Sem Formato Físico',
        author: 'Autor Teste',
        coverImage: 'https://m.media-amazon.com/images/I/815d9tE7jSL.jpg',
        category: 'IA',
        rating: 1,
        language: 'Português',
        description: 'Este é um livro de teste que não possui uma versão em Capa Dura, apenas outras opções.',
        editions: [
            { format: 'Capa Comum', price: 45.00 },
            { format: 'E-book', price: 25.00 }
        ]
    }
];
//Exportar os livros
module.exports = booksData;