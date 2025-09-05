const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT tokens with better error handling
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Log auth header for debugging
  logger.info('Auth header received:', authHeader);
  
  if (!authHeader) {
    logger.warn('No authorization header provided');
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // Check if header follows 'Bearer <token>' format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn('Invalid authorization header format:', authHeader);
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization header format. Use: Bearer <token>'
    });
  }

  const token = parts[1];
  
  // Log the extracted token
  logger.info('Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
  
  if (!token) {
    logger.warn('No token found in authorization header');
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // Validate JWT format (should have 3 parts separated by dots)
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    logger.warn('Token format invalid:', token);
    return res.status(401).json({
      success: false,
      message: 'Invalid token format'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      logger.warn(`Token verification failed from ${req.ip}: ${err.message}`);
      logger.warn('Token that failed:', token);
      logger.warn('JWT_SECRET being used:', process.env.JWT_SECRET);
      
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Verify user still exists and is active
    const db = getDatabase();
    
    const userResult = await db.query('SELECT * FROM users WHERE id = $1 AND "isActive" = $2', [user.userId, true]);
    const dbUser = userResult.rows[0];

    if (!dbUser) {
      logger.warn('User not found or inactive:', user.userId);
      return res.status(403).json({
        success: false,
        message: 'User account not found or deactivated'
      });
    }

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      firstName: dbUser.firstname,
      lastName: dbUser.lastname
    };
    
    next();
  });
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${userRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user can edit (ADMIN or EDITOR roles)
 */
const requireEditor = requireRole(['ADMIN', 'EDITOR']);

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole(['ADMIN']);

module.exports = {
  authenticateToken,
  requireRole,
  requireEditor,
  requireAdmin
};
