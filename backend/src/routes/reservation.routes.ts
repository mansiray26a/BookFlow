import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', ReservationController.createReservation);
router.get('/my-reservations', ReservationController.getMyReservations);
router.delete('/:id', ReservationController.cancelReservation);
router.get('/', authorize(['ADMIN', 'LIBRARIAN']), ReservationController.getAllReservations);

export default router;
