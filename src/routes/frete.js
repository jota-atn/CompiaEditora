import express from 'express';
const router = express.Router();

import { calcularFrete } from '../controllers/freteController.js';

/**
 * @route POST /api/frete
 * @description Rota para calcular o preço da entrega de uma encomenda.
 * @param {object} req.body - O corpo da requisição contendo os dados para o cálculo.
 * @param {string} req.body.to_postal_code - O CEP de destino para a entrega.
 * @param {number} req.body.weight - O peso do pacote em quilogramas (kg).
 * @param {number} req.body.width - A largura do pacote em centímetros (cm).
 * @param {number} req.body.height - A altura do pacote em centímetros (cm).
 * @param {number} req.body.length - O comprimento do pacote em centímetros (cm).
 * @returns {object[]} res - Em caso de sucesso, retorna um array de objetos, onde cada objeto é uma opção de frete.
 * @returns {object} res - Em caso de erro, retorna um objeto com uma propriedade 'error'.
 */
router.post('/', calcularFrete);

export default router;