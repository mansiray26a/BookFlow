import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'LIBRARIAN']), UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.patch('/:id/status', authorize(['ADMIN']), UserController.updateUserStatus);
router.post('/librarians', authorize(['ADMIN']), UserController.createLibrarian);

export default router;
