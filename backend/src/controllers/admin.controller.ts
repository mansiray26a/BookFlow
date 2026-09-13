import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  static async getDashboardAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardAnalytics();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await AdminService.getSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await AdminService.updateSettings(req.body, req.user!.userId);
      res.status(200).json({ success: true, message: 'Library policy settings updated', data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AdminService.getAuditLogs();
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  // Categories, Authors, Publishers
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await AdminService.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await AdminService.createCategory(req.body);
      res.status(201).json({ success: true, message: 'Category created', data: category });
    } catch (error) {
      next(error);
    }
  }

  static async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      const authors = await AdminService.getAuthors();
      res.status(200).json({ success: true, data: authors });
    } catch (error) {
      next(error);
    }
  }

  static async createAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const author = await AdminService.createAuthor(req.body);
      res.status(201).json({ success: true, message: 'Author created', data: author });
    } catch (error) {
      next(error);
    }
  }

  static async getPublishers(req: Request, res: Response, next: NextFunction) {
    try {
      const publishers = await AdminService.getPublishers();
      res.status(200).json({ success: true, data: publishers });
    } catch (error) {
      next(error);
    }
  }

  static async createPublisher(req: Request, res: Response, next: NextFunction) {
    try {
      const publisher = await AdminService.createPublisher(req.body);
      res.status(201).json({ success: true, message: 'Publisher created', data: publisher });
    } catch (error) {
      next(error);
    }
  }
}
