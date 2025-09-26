import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
    register, 
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
} from '../controllers/userController.js';


// --- Rotas Públicas ---
router.post('/register', register);
router.post('/login', login);

// --- Rotas Protegidas ---
// O 'authenticateToken' vai rodar ANTES de cada uma dessas funções.
// Se o token não for válido, o usuário nunca chegará a getUserProfile, etc.
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.delete('/profile', authenticateToken, deleteUserProfile);

export default router;