import { Router } from 'express';
import { FineController } from '../controllers/fine.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/my-fines', FineController.getMyFines);
router.get('/', authorize(['ADMIN', 'LIBRARIAN']), FineController.getAllFines);
router.post('/:id/pay', FineController.payFine);
router.post('/:id/waive', authorize(['ADMIN', 'LIBRARIAN']), FineController.waiveFine);

export default router;
