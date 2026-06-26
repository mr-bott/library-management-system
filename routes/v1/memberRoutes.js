const express = require('express');
const router = express.Router();
const { getMembers, deleteMember, getMyBorrowedBooks } = require('../../controllers/memberController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Member Routes (Self)
router.get('/me/books', protect, authorize('member'), getMyBorrowedBooks);

// Librarian Routes (Manage Members)
router.route('/')
  .get(protect, authorize('librarian'), getMembers);

router.route('/:id')
  .delete(protect, authorize('librarian'), deleteMember);

module.exports = router;
