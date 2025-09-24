import express from 'express';
const router = express.Router();

import { criarPagamentoPix } from '../controllers/pagamentoController.js';

/**
 * @route   POST /
 * @description Rota para iniciar a criação de uma cobrança PIX.
 * @param   {object} req.body - O corpo da requisição deve conter os dados necessários para a cobrança.
 * @param   {number} req.body.amount - Valor da cobrança em centavos.
 * @param   {number} req.body.expiresIn - Tempo de expiração da cobrança em segundos.
 * @param   {string} req.body.description - Mensagem que aparecerá na hora do pagamento do PIX (máx 140 caracteres).
 * @param   {string} req.body.name - Nome completo do cliente pagador.
 * @param   {string} req.body.cellphone - Número de celular do cliente (com DDD).
 * @param   {string} req.body.email - Email do cliente.
 * @param   {string} req.body.taxId - CPF ou CNPJ do cliente.
 * @example
 * // Exemplo de corpo da requisição (Body) em JSON:
 * {
 * "amount": 1000, // R$ 10,00
 * "expiresIn": 3600, // Expira em 1 hora
 * "description": "Pedido #123 - Livro 'O Hobbit'",
 * "customer": {
 * "name": "Fulano de Tal",
 * "cellphone": "11987654321",
 * "email": "fulano@email.com",
 * "taxId": "12345678900"
 * }
 * }
 * @returns {object} Em caso de sucesso, retorna o objeto da cobrança PIX gerada pela API do Abacate Pay. Em caso 
 * de falha, retorna um objeto de erro.
 */
router.post('/', criarPagamentoPix);

export default router;