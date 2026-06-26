const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log error for debugging

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Optional: hide stack in production
  });
};

module.exports = {
  errorHandler,
};
