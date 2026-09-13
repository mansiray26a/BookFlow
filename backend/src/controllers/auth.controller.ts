import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import {
  registerStudentSchema,
  registerFacultySchema,
  loginSchema,
} from '../validators/auth.validator';

export class AuthController {
  static async registerStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerStudentSchema.parse(req.body);
      const result = await AuthService.registerStudent(validated);
      res.status(201).json({ success: true, message: 'Student registered successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async registerFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerFacultySchema.parse(req.body);
      const result = await AuthService.registerFaculty(validated);
      res.status(201).json({ success: true, message: 'Faculty registered successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated.email, validated.password);
      res.status(200).json({ success: true, message: 'Login successful', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
