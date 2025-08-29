const Joi = require('joi');
const { AppError } = require('./errorHandler');

/**
 * Validation schemas
 */
const schemas = {
  // User validation schemas
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('ADMIN', 'EDITOR', 'VIEWER').default('VIEWER')
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  userUpdate: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    role: Joi.string().valid('ADMIN', 'EDITOR', 'VIEWER'),
    isActive: Joi.boolean()
  }).min(1),

  // Sewadar validation schemas
  sewadarCreate: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    age: Joi.number().integer().min(1).max(120),
    verificationId: Joi.string().max(50),
    verificationType: Joi.string().valid('AADHAR', 'PAN', 'VOTER_ID', 'PASSPORT'),
    naamdanStatus: Joi.boolean().default(false),
    naamdanId: Joi.string().max(20).allow('', null),
    badgeId: Joi.string().max(20).allow('', null)
  }),

  sewadarUpdate: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    age: Joi.number().integer().min(1).max(120),
    verificationId: Joi.string().max(50),
    verificationType: Joi.string().valid('AADHAR', 'PAN', 'VOTER_ID', 'PASSPORT'),
    naamdanStatus: Joi.boolean(),
    naamdanId: Joi.string().max(20).allow('', null),
    badgeId: Joi.string().max(20).allow('', null)
  }).min(1)
};

/**
 * Middleware factory for request validation
 */
const validate = (schemaName, property = 'body') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      throw new AppError('Invalid validation schema', 500);
    }

    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new AppError('Validation failed', 400, details);
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Common validation patterns
 */
const validationPatterns = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/
};

module.exports = {
  validate,
  schemas,
  validationPatterns
};