const API_URL = '/api/orders';

export const createOrder = async (orderData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Falha ao criar o pedido.');
    }
    return response.json();
};

export const getMyOrders = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Falha ao buscar o histórico de pedidos.');
    return response.json();
};