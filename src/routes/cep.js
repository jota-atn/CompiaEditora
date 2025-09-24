import express from 'express';
import { consultarCep } from '../controllers/cepController.js';

const router = express.Router();

/**
 * @route   GET /api/cep/:cep
 * @description Rota para obter informações de um endereço a partir de um CEP.
 * @param {string} :cep - O CEP a ser consultado (com ou sem formatação).
 */
router.get('/:cep', consultarCep);

export default router;
