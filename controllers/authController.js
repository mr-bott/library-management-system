const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// @desc    Register a new user (Member only by default, Librarian directly inserted)
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user (force role to member unless overridden by DB seed)
    const user = await User.create({
      name,
      email,
      password, // Password hashing is now handled by the User model's pre-save hook
      role: role === 'librarian' ? 'member' : (role || 'member'), // Enforce member role for public registration
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token in DB
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        success: true,
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken,
          refreshToken
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(401);
      throw new Error('Refresh token is required');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Find user by token
    const user = await User.findOne({ _id: decoded.id, refreshToken: token });

    if (!user) {
      res.status(403);
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id, user.role);

    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    res.status(403);
    next(new Error('Invalid or expired refresh token'));
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken
};
