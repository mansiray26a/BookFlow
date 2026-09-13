import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register/student', AuthController.registerStudent);
router.post('/register/faculty', AuthController.registerFaculty);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

export default router;
