const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null, // null means it has not been returned yet
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned'],
      default: 'borrowed',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Borrow = mongoose.model('Borrow', borrowSchema);
module.exports = Borrow;
