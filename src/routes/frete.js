const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');

/**
 * @route POST /api/frete
 * @description Rota para calcular o preço e o prazo de entrega de uma encomenda.
 * @access Public
 * @param {object} req.body.data - O corpo da requisição deve ser um JSON contendo os detalhes do frete.
 * @param {string} req.body.data.cepOrigem - CEP de origem (apenas números).
 * @param {string} req.body.data.cepDestino - CEP de destino (apenas números).
 * @param {string} req.body.data.pesoKg - Peso do pacote em Kg.
 * @param {string} req.body.data.formato - Código do formato (1: Caixa, 2: Rolo, 3: Envelope).
 * @param {string} req.body.data.comprimento - Comprimento do pacote em cm.
 * @param {string} req.body.data.altura - Altura do pacote em cm.
 * @param {string} req.body.data.largura - Largura do pacote em cm.
 * @param {string} req.body.data.valorDeclarado - Valor declarado do produto para seguro.
 * @returns {object} 200 - Retorna um JSON com o valor e o prazo do frete.
 * @returns {object} 400 - Retorna um erro se os Correios retornarem uma mensagem de erro (ex: CEP inválido).
 * @returns {object} 500 - Retorna um erro interno do servidor.
 */
router.post('/', freteController.calcularFrete);

module.exports = router;