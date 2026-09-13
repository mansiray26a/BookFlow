import { Request, Response, NextFunction } from 'express';
import { FineService } from '../services/fine.service';
import { payFineSchema, waiveFineSchema } from '../validators/circulation.validator';

export class FineController {
  static async getMyFines(req: Request, res: Response, next: NextFunction) {
    try {
      const fines = await FineService.getUserFines(req.user!.userId);
      res.status(200).json({ success: true, data: fines });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFines(req: Request, res: Response, next: NextFunction) {
    try {
      const fines = await FineService.getAllFines(req.query);
      res.status(200).json({ success: true, data: fines });
    } catch (error) {
      next(error);
    }
  }

  static async payFine(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = payFineSchema.parse(req.body);
      const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'LIBRARIAN';
      const fine = await FineService.payFine(
        req.params.id,
        validated.amount,
        validated.paymentMethod,
        validated.transactionRef,
        isStaff ? req.user!.userId : undefined
      );
      res.status(200).json({ success: true, message: 'Fine payment recorded', data: fine });
    } catch (error) {
      next(error);
    }
  }

  static async waiveFine(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = waiveFineSchema.parse(req.body);
      const fine = await FineService.waiveFine(req.params.id, validated.reason, req.user!.userId);
      res.status(200).json({ success: true, message: 'Fine waived successfully', data: fine });
    } catch (error) {
      next(error);
    }
  }
}
