const { body, validationResult } = require('express-validator');
const dns = require('dns');

const validateRegistration = [
  // Validate email
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .bail() // Stop running validators if the previous one failed
    .custom(async (email) => {
      const domain = email.split('@')[1];

      // Quick blacklist for common invalid domains
      const blockedDomains = ['example.com', 'test.com', 'invalid.com'];
      if (blockedDomains.includes(domain)) {
        return Promise.reject('This email domain is not allowed.');
      }

      // Check for valid MX records (optional - skip if DNS fails)
      try {
        const addresses = await dns.promises.resolveMx(domain);
        if (!addresses || addresses.length === 0) {
          console.log(`Warning: No MX records found for ${domain}, but allowing registration`);
          // Don't reject, just log a warning
        }
      } catch (error) {
        // If DNS resolution fails, just log and continue
        console.log(`DNS resolution failed for ${domain}, but allowing registration:`, error.message);
        // Don't reject the registration
      }
    }),

  // Validate password
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters long.')
    .matches(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])/)
    .withMessage('Password must contain at least one alphabet, one digit, and one symbol.'),

  // Middleware to handle the validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
];

module.exports = {
  validateRegistration,
};