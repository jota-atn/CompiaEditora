import { createOrder, findOrdersByUserId } from '../database/database.js';

/**
 * Cria um novo pedido para o usuário logado.
 */
export const createNewOrder = (req, res) => {
    // O ID do usuário vem do nosso middleware de autenticação
    const userId = req.user.id;
    const orderData = req.body;

    // Adiciona a data atual ao pedido
    orderData.orderDate = new Date().toISOString();

    createOrder(userId, orderData, (err, newOrder) => {
        if (err) {
            console.error("Erro no controller ao criar pedido:", err);
            return res.status(500).json({ error: 'Falha ao salvar o pedido no banco de dados.' });
        }
        res.status(201).json({ message: 'Pedido criado com sucesso!', orderId: newOrder.id });
    });
};

/**
 * Busca o histórico de pedidos do usuário logado.
 */
export const getOrderHistory = (req, res) => {
    const userId = req.user.id;

    findOrdersByUserId(userId, (err, orders) => {
        if (err) {
            console.error("Erro no controller ao buscar pedidos:", err);
            return res.status(500).json({ error: 'Falha ao buscar o histórico de pedidos.' });
        }
        res.status(200).json(orders);
    });
};