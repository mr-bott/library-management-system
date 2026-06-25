const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true, // For faster search
    },
    author: {
      type: String,
      required: true,
      trim: true,
      index: true, // For faster search
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true, // For faster filtering
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
