const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { validate } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Login endpoint
 */
router.post('/login', 
  validate('userLogin'), 
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const db = getDatabase();

    // Find user by email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1 AND "isActive" = $2', [email, true]);

    const user = userResult.rows[0];

    if (!user) {
      logger.warn(`Login attempt with invalid email: ${email} from ${req.ip}`);
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      logger.warn(`Invalid password attempt for user: ${email} from ${req.ip}`);
      throw new AppError('Invalid email or password', 401);
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log successful login
    await db.query(
      'INSERT INTO audit_logs (id, action, userid, entity, entityid, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [uuidv4(), 'LOGIN', user.id, 'USER', user.id, `User logged in from ${req.ip}`]
    );

    logger.info(`User ${email} logged in successfully from ${req.ip}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstname,  // ✅ FIXED: Using snake_case from DB
        lastName: user.lastname,    // ✅ FIXED: Using snake_case from DB
        role: user.role
      }
    });
  })
);

// User registration
router.post('/register', authenticateToken, validate('userRegistration'), asyncHandler(async (req, res) => {
  // Only admins can create new users
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only administrators can register new users', 403);
  }

  const { email, password, firstName, lastName, role } = req.body;
  const db = getDatabase();

  // Check if user already exists
  const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  const existingUser = existingResult.rows[0];

  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create new user
  const userId = uuidv4();
  await db.query(
    'INSERT INTO users (id, email, password, firstname, lastname, role, "isActive") VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [userId, email, hashedPassword, firstName, lastName, role, true]
  );

  // ✅ FIXED: Log user creation with PostgreSQL
  await db.query(
    'INSERT INTO audit_logs (id, action, userid, entity, entityid, details) VALUES ($1, $2, $3, $4, $5, $6)',
    [uuidv4(), 'CREATE_USER', req.user.userId, 'USER', userId, `Created new user: ${email} with role: ${role}`]
  );

  logger.info(`New user registered: ${email} by admin: ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: userId,
      email,
      firstName,
      lastName,
      role
    }
  });
}));

// ✅ FIXED: Get current user profile
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();

  const userResult = await db.query(`
    SELECT id, email, firstname AS "firstName", lastname AS "lastName", 
           role, "isActive" AS "isActive", createdat AS "createdAt", 
           updatedat AS "updatedAt"
    FROM users 
    WHERE id = $1
  `, [req.user.userId]);
  
  const user = userResult.rows[0];

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    user
  });
}));

// Update user profile
router.put('/profile', authenticateToken, validate('userProfileUpdate'), asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const userId = req.user.userId;
  const db = getDatabase();

  // Check if email is being changed and if it already exists
  if (email !== req.user.email) {
    const existingResult = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
    if (existingResult.rows.length > 0) {
      throw new AppError('Email already exists', 409);
    }
  }

  // Update user profile
  await db.query(
    'UPDATE users SET firstname = $1, lastname = $2, email = $3, updatedat = NOW() WHERE id = $4',
    [firstName, lastName, email, userId]
  );

  // Get updated user data
  const userResult = await db.query(`
    SELECT id, email, firstname AS "firstName", lastname AS "lastName", 
           role, "isActive" AS "isActive", createdat AS "createdAt", 
           updatedat AS "updatedAt"
    FROM users 
    WHERE id = $1
  `, [userId]);

  const updatedUser = userResult.rows[0];

  // Log profile update
  await db.query(
    'INSERT INTO audit_logs (id, action, userid, entity, entityid, details) VALUES ($1, $2, $3, $4, $5, $6)',
    [uuidv4(), 'UPDATE_PROFILE', userId, 'USER', userId, `Profile updated from ${req.ip}`]
  );

  logger.info(`User ${req.user.email} updated profile from ${req.ip}`);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
}));

// Change password endpoint
router.post('/change-password', authenticateToken, validate('passwordChange'), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;
  const db = getDatabase();

  // Get user with current password
  const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isCurrentPasswordValid) {
    return res.status(401).json({ 
      success: false, 
      message: 'Current password is incorrect' 
    }); // ✅ This keeps the user logged in
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password in database
  await db.query(
    'UPDATE users SET password = $1, updatedat = NOW() WHERE id = $2',
    [hashedNewPassword, userId]
  );

  // Log password change
  await db.query(
    'INSERT INTO audit_logs (id, action, userid, entity, entityid, details) VALUES ($1, $2, $3, $4, $5, $6)',
    [uuidv4(), 'CHANGE_PASSWORD', userId, 'USER', userId, `Password changed from ${req.ip}`]
  );

  logger.info(`User ${req.user.email} changed password from ${req.ip}`);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Logout with PostgreSQL audit log
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  // Log logout
  await db.query(
    'INSERT INTO audit_logs (id, action, userid, entity, entityid, details) VALUES ($1, $2, $3, $4, $5, $6)',
    [uuidv4(), 'LOGOUT', req.user.userId, 'USER', req.user.userId, `User logged out from ${req.ip}`]
  );

  logger.info(`User ${req.user.email} logged out from ${req.ip}`);

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

module.exports = router;