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
    const userResult = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
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
      'INSERT INTO audit_logs (id, action, user_id, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
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
        firstName: user.first_name,  // ✅ FIXED: Using snake_case from DB
        lastName: user.last_name,    // ✅ FIXED: Using snake_case from DB
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
    'INSERT INTO users (id, email, password, first_name, last_name, role, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [userId, email, hashedPassword, firstName, lastName, role, true]
  );

  // ✅ FIXED: Log user creation with PostgreSQL
  await db.query(
    'INSERT INTO audit_logs (id, action, user_id, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
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
    SELECT id, email, first_name AS "firstName", last_name AS "lastName", 
           role, is_active AS "isActive", created_at AS "createdAt", 
           updated_at AS "updatedAt"
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

// ✅ FIXED: Logout with PostgreSQL audit log
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  // Log logout
  await db.query(
    'INSERT INTO audit_logs (id, action, user_id, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
    [uuidv4(), 'LOGOUT', req.user.userId, 'USER', req.user.userId, `User logged out from ${req.ip}`]
  );

  logger.info(`User ${req.user.email} logged out from ${req.ip}`);

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

module.exports = router;