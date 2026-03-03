import { body, param, query, validationResult } from 'express-validator';

// Validation result handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Fisherfolk validation rules
export const fisherfolkValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number'),
  body('province')
    .trim()
    .notEmpty()
    .withMessage('Province is required'),
  body('estimatedIncome')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Income must be a positive number'),
];

// Organization validation rules
export const organizationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Cooperative', 'Association', 'Union', 'Foundation'])
    .withMessage('Invalid category'),
];

// Boat validation rules
export const boatValidation = [
  body('boatName')
    .trim()
    .notEmpty()
    .withMessage('Boat name is required'),
  body('boatType')
    .trim()
    .notEmpty()
    .withMessage('Boat type is required'),
  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required'),
  body('owner')
    .trim()
    .notEmpty()
    .withMessage('Owner is required'),
];

// Gear validation rules
export const gearValidation = [
  body('gearType')
    .trim()
    .notEmpty()
    .withMessage('Gear type is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('condition')
    .trim()
    .isIn(['Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
];

// Login validation
export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Map layer validation
export const mapLayerValidation = [
  body('layerName')
    .trim()
    .notEmpty()
    .withMessage('Layer name is required'),
  body('layerType')
    .isIn(['fishing_zone', 'mangrove', 'city', 'protected_area', 'buffer_zone'])
    .withMessage('Invalid layer type'),
  body('coordinates.type')
    .isIn(['Point', 'Polygon', 'MultiPolygon'])
    .withMessage('Invalid coordinate type'),
];

// ID parameter validation
export const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be greater than 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export default {
  handleValidationErrors,
  fisherfolkValidation,
  organizationValidation,
  boatValidation,
  gearValidation,
  loginValidation,
  mapLayerValidation,
  idValidation,
  paginationValidation,
};
