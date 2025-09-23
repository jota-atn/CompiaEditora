export const userData = {
    name: 'Alexandre Costa',
    email: 'alexandre.costa@email.com',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    since: 'Membro desde 2024',
    phone: '(83) 99999-8888',
    birthDate: '15/08/1990',
    cpf: '123.456.789-00',
    addresses: [
        { id: 1, street: 'Rua das Flores, 123', city: 'São Paulo, SP', cep: '01234-567', default: true },
        { id: 2, street: 'Av. Principal, 456', city: 'Rio de Janeiro, RJ', cep: '98765-432', default: false }
    ],
    paymentMethods: [
        { id: 1, type: 'Mastercard', last4: '1234', expiry: '12/26' },
        { id: 2, type: 'Visa', last4: '5678', expiry: '08/25' }
    ],
    orders: [
        { 
            id: 'XYZ-123', 
            date: '10/09/2025', 
            total: 'R$ 159,90', 
            status: 'Entregue', 
            trackingCode: 'BR123456789BR',
            items: [
                { 
                    title: 'Deep Learning: Fundamentos e Aplicações', 
                    format: 'E-book', 
                    quantity: 1, 
                    price: 89.90, 
                    coverImage: 'https://m.media-amazon.com/images/I/A10G+oKN3LL._UF894,1000_QL80_.jpg' 
                },
                { 
                    title: 'Python Avançado para Ciência de Dados', 
                    format: 'E-book', 
                    quantity: 1, 
                    price: 70.00, 
                    coverImage: 'https://m.media-amazon.com/images/I/91DGHmkQmjL._SL1500_.jpg' 
                }
            ] 
        },
        { 
            id: 'ABC-456', 
            date: '12/09/2025', 
            total: 'R$ 94,90', 
            status: 'A caminho', 
            trackingCode: 'BR987654321BR',
            items: [
                { 
                    title: 'Ethical Hacking: Segurança Ofensiva', 
                    format: 'Capa Comum', 
                    quantity: 1, 
                    price: 94.90, 
                    coverImage: 'https://m.media-amazon.com/images/I/91LldWCllgS._SL1500_.jpg' 
                }
            ]
        }
    ]
};