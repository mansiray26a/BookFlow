import { Request, Response, NextFunction } from 'express';
import { CirculationService } from '../services/circulation.service';
import { issueBookSchema, returnBookSchema } from '../validators/circulation.validator';

export class CirculationController {
  static async issueBook(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = issueBookSchema.parse(req.body);
      const issue = await CirculationService.issueBook(
        validated.copyBarcode,
        validated.userId,
        req.user!.userId
      );
      res.status(201).json({ success: true, message: 'Book issued successfully', data: issue });
    } catch (error) {
      next(error);
    }
  }

  static async returnBook(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = returnBookSchema.parse(req.body);
      const result = await CirculationService.returnBook(
        validated.copyBarcode,
        req.user!.userId,
        validated.condition
      );
      res.status(200).json({ success: true, message: 'Book copy returned successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async renewBook(req: Request, res: Response, next: NextFunction) {
    try {
      const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'LIBRARIAN';
      const issue = await CirculationService.renewBook(req.params.id, req.user!.userId, isStaff);
      res.status(200).json({ success: true, message: 'Book loan renewed successfully', data: issue });
    } catch (error) {
      next(error);
    }
  }

  static async getMyIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const issues = await CirculationService.getUserIssues(req.user!.userId);
      res.status(200).json({ success: true, data: issues });
    } catch (error) {
      next(error);
    }
  }

  static async getAllIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CirculationService.getAllIssues(req.query);
      res.status(200).json({ success: true, data: result.issues, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }
}
