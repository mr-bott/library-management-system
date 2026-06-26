const { check, validationResult } = require('express-validator');

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  res.status(400);
  return next(new Error(`Validation failed: ${JSON.stringify(extractedErrors)}`));
};

// Auth Validations
const registerValidation = [
  check('name', 'Name is required').not().isEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role', 'Role must be either member or librarian').optional().isIn(['member', 'librarian']),
  validate
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
  validate
];

// Book Validations
const bookValidation = [
  check('title', 'Title is required').not().isEmpty().trim(),
  check('author', 'Author is required').not().isEmpty().trim(),
  check('isbn', 'ISBN is required').not().isEmpty().trim(),
  check('category', 'Category is required').not().isEmpty().trim(),
  check('quantity', 'Quantity must be a positive number').isInt({ min: 0 }),
  check('availableQuantity', 'Available quantity must be a positive number').isInt({ min: 0 }),
  validate
];

const updateBookValidation = [
  check('title', 'Title cannot be empty').optional().not().isEmpty().trim(),
  check('author', 'Author cannot be empty').optional().not().isEmpty().trim(),
  check('isbn', 'ISBN cannot be empty').optional().not().isEmpty().trim(),
  check('category', 'Category cannot be empty').optional().not().isEmpty().trim(),
  check('quantity', 'Quantity must be a positive number').optional().isInt({ min: 0 }),
  check('availableQuantity', 'Available quantity must be a positive number').optional().isInt({ min: 0 }),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  bookValidation,
  updateBookValidation
};
