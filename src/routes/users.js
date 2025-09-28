
import express from 'express';
const router = express.Router();

// Middleware de autenticação que você já tem
import { authenticateToken } from '../middleware/authMiddleware.js';

// Funções do seu controller
import { 
    register, 
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
} from '../controllers/userController.js';

import { getAllUsers } from '../database/database.js';


// --- Rotas Públicas ---
router.post('/register', register);
router.post('/login', login);

// --- Rotas Protegidas ---
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.delete('/profile', authenticateToken, deleteUserProfile);


// ROTA PARA O ADMIN PEGAR TODOS OS USUÁRIOS
router.get('/all', authenticateToken, (req, res) => {
    
    getAllUsers((err, users) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao buscar usuários no banco.", error: err.message });
        }
        res.json(users);
    });
});

export default router;