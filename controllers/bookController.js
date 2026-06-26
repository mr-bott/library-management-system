const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

// @desc    Get all books (with pagination, search, filter)
// @route   GET /api/v1/books
// @access  Private (All authenticated users)
const getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;

    const query = {};

    // Search by title or author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Book.countDocuments(query);

    res.json({
      success: true,
      data: books,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalBooks: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single book by ID
// @route   GET /api/v1/books/:id
// @access  Private
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new book
// @route   POST /api/v1/books
// @access  Private (Librarian only)
const addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, quantity, availableQuantity } = req.body;

    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      res.status(400);
      throw new Error('Book with this ISBN already exists');
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      quantity,
      availableQuantity: availableQuantity !== undefined ? availableQuantity : quantity
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book
// @route   PUT /api/v1/books/:id
// @access  Private (Librarian only)
const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book
// @route   DELETE /api/v1/books/:id
// @access  Private (Librarian only)
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    await book.deleteOne();
    res.json({ success: true, message: 'Book removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Borrow a book
// @route   POST /api/v1/books/:id/borrow
// @access  Private (Member only)
const borrowBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const memberId = req.user._id;

    // 1. Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }

    // 2. Check if available
    if (book.availableQuantity <= 0) {
      res.status(400);
      throw new Error('Book is currently unavailable.');
    }

    // 3. Check if member already borrowed this book and hasn't returned it
    const existingBorrow = await Borrow.findOne({
      memberId,
      bookId,
      status: 'borrowed'
    });

    if (existingBorrow) {
      res.status(400);
      throw new Error('You have already borrowed this book. Please return it first.');
    }

    // 4. Create borrow record
    const borrowRecord = await Borrow.create({
      memberId,
      bookId,
      status: 'borrowed'
    });

    // 5. Decrease available quantity
    book.availableQuantity -= 1;
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book borrowed successfully',
      data: borrowRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return a book
// @route   POST /api/v1/books/:id/return
// @access  Private (Member only)
const returnBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const memberId = req.user._id;

    // 1. Find the active borrow record
    const borrowRecord = await Borrow.findOne({
      memberId,
      bookId,
      status: 'borrowed'
    });

    if (!borrowRecord) {
      res.status(400);
      throw new Error('You have not borrowed this book or it has already been returned.');
    }

    // 2. Update borrow record
    borrowRecord.status = 'returned';
    borrowRecord.returnDate = Date.now();
    await borrowRecord.save();

    // 3. Update book availability
    const book = await Book.findById(bookId);
    book.availableQuantity += 1;
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: borrowRecord
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
};
