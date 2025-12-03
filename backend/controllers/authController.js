const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const ErrorResponse = require('../utils/errorResponse');
const dbConfig = require('../config/db');

// Helper function to log actions with timestamps
const debugLog = (message, data = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`, data || '');
};

// Generate JWT Token with enhanced security
const generateToken = (user) => {
  return jwt.sign(
    { 
      user: { 
        id: user._id,
        role: user.role || 'user' // Add role if your system has it
      } 
    },
    dbConfig.jwtSecret,
    { 
      expiresIn: dbConfig.jwtExpire || '7d',
      algorithm: 'HS256' // Explicitly specify algorithm
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    debugLog('Validation failed', errors.array());
    return next(new ErrorResponse('Validation failed', 400, { errors: errors.array() }));
  }

  const { name, email, password } = req.body;

  try {
    debugLog(`Registration attempt for: ${email}`);
    
    // Check existing user with case-insensitive email
    let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    
    if (user) {
      debugLog('Registration failed - user exists', { email });
      return next(new ErrorResponse('User already exists', 409)); // 409 Conflict
    }

    user = new User({ 
      name,
      email: email.toLowerCase(), // Store email in lowercase
      password
    });

    await user.save();
    debugLog('User successfully registered', { userId: user._id });

    const token = generateToken(user);
    
    res.status(201).json({ 
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    debugLog('Registration error', err.message);
    next(new ErrorResponse('Server error during registration', 500));
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse('Validation failed', 400, { errors: errors.array() }));
  }

  const { email, password } = req.body;

  try {
    debugLog(`Login attempt for: ${email}`);
    
    // Find user with case-insensitive email
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password +loginAttempts +lockUntil');
    
    if (!user) {
      debugLog('Login failed - user not found', { email });
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const retryAfter = Math.ceil((user.lockUntil - Date.now()) / 1000);
      return next(new ErrorResponse(
        'Account locked due to too many failed attempts', 
        423, // Locked status
        { retryAfter }
      ));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
      }
      await user.save();
      
      debugLog('Login failed - invalid password', { email });
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = generateToken(user);
    
    debugLog('Login successful', { userId: user._id });
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    debugLog('Login error', err.message);
    next(new ErrorResponse('Server error during login', 500));
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    debugLog(`Fetching user data for: ${req.user.id}`);
    
    const user = await User.findById(req.user.id)
      .select('-password -loginAttempts -lockUntil');
    
    if (!user) {
      debugLog('User not found', { userId: req.user.id });
      return next(new ErrorResponse('User not found', 404));
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (err) {
    debugLog('GetMe error', err.message);
    next(new ErrorResponse('Server error fetching user data', 500));
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email.toLowerCase() // Normalize email
    };

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      fieldsToUpdate, 
      { 
        new: true,
        runValidators: true,
        select: '-password -loginAttempts -lockUntil'
      }
    );

    res.json({
      success: true,
      user
    });

  } catch (err) {
    next(new ErrorResponse('Update failed', 400));
  }
};

// @desc    Logout user (client should discard token)
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // In a real app, you might want to implement token blacklisting here
    res.json({ 
      success: true,
      message: 'Token discarded (client should remove token from storage)'
    });
  } catch (err) {
    next(new ErrorResponse('Logout error', 500));
  }
};