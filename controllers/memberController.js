const User = require('../models/User');
const Borrow = require('../models/Borrow');

// @desc    Get all members
// @route   GET /api/v1/members
// @access  Private (Librarian only)
const getMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = { role: 'member' }; // Only fetch members, not librarians

    const members = await User.find(query)
      .select('-password -refreshToken') // Exclude sensitive info
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: members,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalMembers: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a member
// @route   DELETE /api/v1/members/:id
// @access  Private (Librarian only)
const deleteMember = async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error('Member not found');
    }

    // Ensure we are deleting a member, not another librarian
    if (member.role !== 'member') {
      res.status(400);
      throw new Error('Cannot delete a librarian account');
    }

    // Optional: Check if member has active borrows before deleting
    const activeBorrows = await Borrow.findOne({ memberId: member._id, status: 'borrowed' });
    if (activeBorrows) {
      res.status(400);
      throw new Error('Cannot delete member with active borrowed books. They must return them first.');
    }

    await member.deleteOne();
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in member's borrowed books
// @route   GET /api/v1/members/me/books
// @access  Private (Member only)
const getMyBorrowedBooks = async (req, res, next) => {
  try {
    // Populate the book details to show what they borrowed
    const borrowHistory = await Borrow.find({ memberId: req.user._id })
      .populate('bookId', 'title author isbn category')
      .sort({ borrowDate: -1 });

    res.json({
      success: true,
      data: borrowHistory
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  deleteMember,
  getMyBorrowedBooks
};
