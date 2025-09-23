import express from 'express';
const router = express.Router();

import { 
    getBooks, 
    setBooks,
    deleteBookController,
    updateBookController
} from '../controllers/bookController.js';

router.get('/', getBooks);
router.post('/', setBooks);
router.delete('/:id', deleteBookController);
router.put('/:id', updateBookController);

export default router;