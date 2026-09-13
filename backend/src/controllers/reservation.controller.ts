import { Request, Response, NextFunction } from 'express';
import { ReservationService } from '../services/reservation.service';
import { reserveBookSchema } from '../validators/circulation.validator';

export class ReservationController {
  static async createReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reserveBookSchema.parse(req.body);
      const reservation = await ReservationService.createReservation(validated.bookId, req.user!.userId);
      res.status(201).json({ success: true, message: 'Reservation placed in queue', data: reservation });
    } catch (error) {
      next(error);
    }
  }

  static async cancelReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'LIBRARIAN';
      const result = await ReservationService.cancelReservation(req.params.id, req.user!.userId, isStaff);
      res.status(200).json({ success: true, message: 'Reservation cancelled', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getMyReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await ReservationService.getUserReservations(req.user!.userId);
      res.status(200).json({ success: true, data: reservations });
    } catch (error) {
      next(error);
    }
  }

  static async getAllReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await ReservationService.getAllReservations();
      res.status(200).json({ success: true, data: reservations });
    } catch (error) {
      next(error);
    }
  }
}
