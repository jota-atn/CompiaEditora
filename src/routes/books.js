const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');

router.get('/', bookController.listarLivros);

router.post('/', bookController.adicionarLivro);

module.exports = router;