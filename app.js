const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/v1/authRoutes');
const bookRoutes = require('./routes/v1/bookRoutes');
const memberRoutes = require('./routes/v1/memberRoutes');

const app = express();

// Global Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Request logging

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/members', memberRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
