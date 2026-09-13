import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  isbn: z.string().min(3, 'Valid ISBN is required'),
  description: z.string().optional(),
  coverImage: z.string().url('Invalid image URL').optional().or(z.literal('')),
  publicationYear: z.number().int().min(1000).max(new Date().getFullYear()),
  edition: z.string().optional(),
  language: z.string().default('English'),
  pages: z.number().int().positive().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  publisherId: z.string().min(1, 'Publisher is required'),
  authorIds: z.array(z.string()).min(1, 'At least one author is required'),
});

export const updateBookSchema = createBookSchema.partial();

export const createCopySchema = z.object({
  barcode: z.string().min(3, 'Barcode is required'),
  qrCodePayload: z.string().optional(),
  copyNumber: z.number().int().positive(),
  shelfLocation: z.string().min(1, 'Shelf location is required'),
  status: z.enum(['AVAILABLE', 'ISSUED', 'RESERVED', 'LOST', 'DAMAGED', 'MAINTENANCE']).default('AVAILABLE'),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('GOOD'),
  price: z.number().positive().optional(),
});
