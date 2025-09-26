import express from 'express';
const router = express.Router();

import { register, login } from '../controllers/userController.js';

// Rota para registrar um novo usuário
router.post('/register', register);

// Rota para fazer login
router.post('/login', login);

export default router;