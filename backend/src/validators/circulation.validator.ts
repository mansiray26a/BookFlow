import { z } from 'zod';

export const issueBookSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  copyBarcode: z.string().min(1, 'Book copy barcode is required'),
});

export const returnBookSchema = z.object({
  copyBarcode: z.string().min(1, 'Book copy barcode is required'),
  condition: z.enum(['GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
});

export const reserveBookSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
});

export const payFineSchema = z.object({
  amount: z.number().positive('Payment amount must be positive'),
  paymentMethod: z.enum(['CASH', 'ONLINE', 'UPI', 'CARD']).default('CASH'),
  transactionRef: z.string().optional(),
});

export const waiveFineSchema = z.object({
  reason: z.string().min(3, 'Waiver justification reason is required'),
});
