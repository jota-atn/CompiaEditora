import express from 'express';
const router = express.Router();

import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
    getAddresses,
    addNewAddress,
    updateExistingAddress,
    deleteExistingAddress
} from '../controllers/addressController.js';

//Todas as rotas de endereço são protegidas.
// O middleware 'authenticateToken' vai rodar antes de CADA uma delas.
router.use(authenticateToken);

// Define as rotas para o CRUD de endereços
router.get('/', getAddresses);
router.post('/', addNewAddress);
router.put('/:id', updateExistingAddress);
router.delete('/:id', deleteExistingAddress);

export default router;