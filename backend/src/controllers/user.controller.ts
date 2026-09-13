import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.getUsers(req.query);
      res.status(200).json({ success: true, data: result.users, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const user = await UserService.updateUserStatus(req.params.id, status, req.user!.userId);
      res.status(200).json({ success: true, message: `User status updated to ${status}`, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async createLibrarian(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.createLibrarian(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Librarian account created', data: result });
    } catch (error) {
      next(error);
    }
  }
}
