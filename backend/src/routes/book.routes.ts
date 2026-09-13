import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', BookController.getBooks);
router.get('/:id', BookController.getBookById);
router.get('/copies/scan/:barcode', authenticate, authorize(['ADMIN', 'LIBRARIAN']), BookController.getCopyByBarcode);

router.post('/', authenticate, authorize(['ADMIN', 'LIBRARIAN']), BookController.createBook);
router.post('/:id/copies', authenticate, authorize(['ADMIN', 'LIBRARIAN']), BookController.addCopy);

export default router;
