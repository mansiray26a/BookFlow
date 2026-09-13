import { Router } from 'express';
import { CirculationController } from '../controllers/circulation.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/issue', authorize(['ADMIN', 'LIBRARIAN']), CirculationController.issueBook);
router.post('/return', authorize(['ADMIN', 'LIBRARIAN']), CirculationController.returnBook);
router.post('/:id/renew', CirculationController.renewBook);
router.get('/my-issues', CirculationController.getMyIssues);
router.get('/', authorize(['ADMIN', 'LIBRARIAN']), CirculationController.getAllIssues);

export default router;
