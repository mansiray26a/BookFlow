export interface JwtPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'LIBRARIAN' | 'ADMIN';
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
