import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import { createNewOrder, getOrderHistory } from '../controllers/orderController.js';
import { getAllOrders } from '../database/database.js';

//Todas as rotas de pedido são protegidas pelo nosso middleware.
router.use(authenticateToken);

// Rota para buscar o histórico de pedidos
router.get('/', getOrderHistory);

// Rota para criar um novo pedido
router.post('/', createNewOrder);

router.get('/all', authenticateToken, (req, res) => {

    getAllOrders((err, orders) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao buscar todos os pedidos.", error: err.message });
        }
        res.json(orders);
    });
});


export default router;