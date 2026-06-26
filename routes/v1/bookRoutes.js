const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
} = require('../../controllers/bookController');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { bookValidation, updateBookValidation } = require('../../validators/validationRules');

// Public routes (or any authenticated user can view books)
router.route('/')
  .get(protect, getBooks)
  .post(protect, authorize('librarian'), bookValidation, addBook);

router.route('/:id')
  .get(protect, getBookById)
  .put(protect, authorize('librarian'), updateBookValidation, updateBook)
  .delete(protect, authorize('librarian'), deleteBook);

// Borrow and Return (Members only)
router.post('/:id/borrow', protect, authorize('member'), borrowBook);
router.post('/:id/return', protect, authorize('member'), returnBook);

module.exports = router;
