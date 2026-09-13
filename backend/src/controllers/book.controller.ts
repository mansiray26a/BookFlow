import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { createBookSchema, createCopySchema } from '../validators/book.validator';

export class BookController {
  static async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookService.getBooks(req.query);
      res.status(200).json({ success: true, data: result.books, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await BookService.getBookById(req.params.id);
      res.status(200).json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  }

  static async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createBookSchema.parse(req.body);
      const book = await BookService.createBook(validated, req.user!.userId);
      res.status(201).json({ success: true, message: 'Book created successfully', data: book });
    } catch (error) {
      next(error);
    }
  }

  static async addCopy(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCopySchema.parse(req.body);
      const copy = await BookService.addCopy(req.params.id, validated, req.user!.userId);
      res.status(201).json({ success: true, message: 'Book copy registered successfully', data: copy });
    } catch (error) {
      next(error);
    }
  }

  static async getCopyByBarcode(req: Request, res: Response, next: NextFunction) {
    try {
      const copy = await BookService.getCopyByBarcode(req.params.barcode);
      res.status(200).json({ success: true, data: copy });
    } catch (error) {
      next(error);
    }
  }
}
