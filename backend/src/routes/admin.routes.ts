import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public metadata routes
router.get('/categories', AdminController.getCategories);
router.get('/authors', AdminController.getAuthors);
router.get('/publishers', AdminController.getPublishers);

// Protected Admin routes
router.use(authenticate, authorize(['ADMIN', 'LIBRARIAN']));

router.get('/analytics/dashboard', AdminController.getDashboardAnalytics);
router.get('/settings', AdminController.getSettings);
router.put('/settings', authorize(['ADMIN']), AdminController.updateSettings);
router.get('/audit-logs', AdminController.getAuditLogs);

router.post('/categories', AdminController.createCategory);
router.post('/authors', AdminController.createAuthor);
router.post('/publishers', AdminController.createPublisher);

export default router;
