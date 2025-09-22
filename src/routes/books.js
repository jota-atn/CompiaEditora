import express from 'express';
const router = express.Router();

import { getBooks, setBooks } from '../controllers/bookController.js';

router.get('/', getBooks);
router.post('/', setBooks);

export default router;