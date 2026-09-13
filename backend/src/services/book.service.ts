import { prisma } from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class BookService {
  static async getBooks(query: {
    search?: string;
    category?: string;
    author?: string;
    publisher?: string;
    availability?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { subtitle: { contains: query.search } },
        { isbn: { contains: query.search } },
        { description: { contains: query.search } },
        { authors: { some: { author: { name: { contains: query.search } } } } },
      ];
    }

    if (query.category) {
      where.categoryId = query.category;
    }

    if (query.author) {
      where.authors = { some: { authorId: query.author } };
    }

    if (query.publisher) {
      where.publisherId = query.publisher;
    }

    if (query.availability === 'available') {
      where.copies = { some: { status: 'AVAILABLE' } };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'title_asc') orderBy = { title: 'asc' };
    if (query.sort === 'title_desc') orderBy = { title: 'desc' };
    if (query.sort === 'year_desc') orderBy = { publicationYear: 'desc' };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          publisher: true,
          authors: { include: { author: true } },
          copies: { select: { id: true, status: true, condition: true, shelfLocation: true } },
          _count: { select: { reviews: true, reservations: { where: { status: 'PENDING' } } } },
        },
      }),
      prisma.book.count({ where }),
    ]);

    const formattedBooks = books.map((b) => {
      const availableCopies = b.copies.filter((c) => c.status === 'AVAILABLE').length;
      return {
        ...b,
        totalCopies: b.copies.length,
        availableCopies,
        isAvailable: availableCopies > 0,
      };
    });

    return {
      books: formattedBooks,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getBookById(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        publisher: true,
        authors: { include: { author: true } },
        copies: {
          select: {
            id: true,
            barcode: true,
            qrCodePayload: true,
            copyNumber: true,
            shelfLocation: true,
            status: true,
            condition: true,
            purchaseDate: true,
          },
        },
        reviews: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { reservations: { where: { status: 'PENDING' } } } },
      },
    });

    if (!book) throw new NotFoundError('Book not found in catalog.');

    const availableCopies = book.copies.filter((c) => c.status === 'AVAILABLE').length;

    return {
      ...book,
      totalCopies: book.copies.length,
      availableCopies,
      isAvailable: availableCopies > 0,
    };
  }

  static async createBook(data: any, adminUserId: string) {
    const existingIsbn = await prisma.book.findUnique({ where: { isbn: data.isbn } });
    if (existingIsbn) throw new BadRequestError('A book with this ISBN already exists in the catalog.');

    const { authorIds, ...bookData } = data;

    const book = await prisma.book.create({
      data: {
        ...bookData,
        authors: {
          create: authorIds.map((aId: string) => ({ authorId: aId })),
        },
      },
      include: { category: true, publisher: true, authors: { include: { author: true } } },
    });

    await prisma.auditLog.create({
      data: { userId: adminUserId, action: 'CREATE_BOOK', entity: 'Book', entityId: book.id, details: `Added book "${book.title}" (ISBN: ${book.isbn})` },
    });

    return book;
  }

  static async addCopy(bookId: string, copyData: any, adminUserId: string) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundError('Book not found.');

    const existingBarcode = await prisma.bookCopy.findUnique({ where: { barcode: copyData.barcode } });
    if (existingBarcode) throw new BadRequestError('A physical copy with this Barcode already exists.');

    const copy = await prisma.bookCopy.create({
      data: {
        bookId,
        barcode: copyData.barcode,
        qrCodePayload: copyData.qrCodePayload || `QR-${copyData.barcode}`,
        copyNumber: copyData.copyNumber,
        shelfLocation: copyData.shelfLocation,
        status: copyData.status || 'AVAILABLE',
        condition: copyData.condition || 'GOOD',
        price: copyData.price,
      },
    });

    await prisma.auditLog.create({
      data: { userId: adminUserId, action: 'ADD_BOOK_COPY', entity: 'BookCopy', entityId: copy.id, details: `Added copy barcode ${copy.barcode} to "${book.title}"` },
    });

    return copy;
  }

  static async getCopyByBarcode(barcode: string) {
    const copy = await prisma.bookCopy.findUnique({
      where: { barcode },
      include: {
        book: {
          include: { category: true, authors: { include: { author: true } } },
        },
        issues: {
          where: { status: 'ISSUED' },
          include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
        },
      },
    });

    if (!copy) throw new NotFoundError(`Physical book copy with barcode '${barcode}' not found.`);
    return copy;
  }
}
