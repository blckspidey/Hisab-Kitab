const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

// Function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  const { email, password } = req.body;

  console.log('=== SIGNUP DEBUG ===');
  console.log('Email:', email);
  console.log('Password length:', password ? password.length : 'undefined');

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new user...');
    const user = await User.create({
      email,
      password,
    });

    console.log('User created successfully:', user._id);

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log('=== LOGIN DEBUG ===');
  console.log('Email:', email);
  console.log('Password provided:', !!password);
  console.log('Request body:', req.body);

  try {
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (user) {
      console.log('User details:', {
        _id: user._id,
        email: user.email,
        isSetupComplete: user.isSetupComplete,
        defaultCurrency: user.defaultCurrency
      });
      
      console.log('Comparing password...');
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', passwordMatch);
      
      if (passwordMatch) {
        console.log('Generating token...');
        const token = generateToken(user._id);
        console.log('Token generated successfully');
        
        res.json({
          _id: user._id,
          email: user.email,
          token: token,
          isSetupComplete: user.isSetupComplete,
          defaultCurrency: user.defaultCurrency,
        });
      } else {
        console.log('Password does not match');
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log('User not found');
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  // The user is already available in req.user
  res.status(200).json(req.user);
};

// @desc    Complete user setup
// @route   PUT /api/auth/setup
// @access  Private
const completeSetup = async (req, res) => {
  const { defaultCurrency } = req.body;

  if (!defaultCurrency) {
    return res.status(400).json({ message: 'Default currency is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        defaultCurrency,
        isSetupComplete: true 
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      defaultCurrency: user.defaultCurrency,
      isSetupComplete: user.isSetupComplete,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  completeSetup,
  async changePassword(req, res) {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = newPassword; // pre-save hook will hash
      await user.save();

      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  },
  // Added below
  async forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      const user = await User.findOne({ email });
      // Always respond with success message to avoid user enumeration
      if (!user) {
        return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expires = Date.now() + 1000 * 60 * 15; // 15 minutes

      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = new Date(expires);
      await user.save({ validateBeforeSave: false });

      // Build reset URL for frontend
      const appUrl = process.env.APP_URL || 'http://localhost:5173';
      const resetUrl = `${appUrl}/reset-password/${token}`;

      const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

      if (emailEnabled) {
        const subject = 'Reset your Bento password';
        const html = `
          <p>We received a request to reset your password.</p>
          <p>Click the link below to set a new password. This link expires in 15 minutes.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `;
        const text = `Reset your password: ${resetUrl} (expires in 15 minutes)`;
        try {
          await sendMail({ to: user.email, subject, html, text });
        } catch (mailErr) {
          // Do not fail the request because of mail failures
          console.error('Email send failed:', mailErr.message);
        }
      }

      return res.status(200).json({
        message: emailEnabled ? 'If that email exists, a reset link has been sent' : 'Reset link generated',
        ...(emailEnabled ? {} : { resetUrl }),
      });
    } catch (err) {
      return res.status(500).json({ message: 'Server Error', error: err.message });
    }
  },

  async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Token is invalid or has expired' });
      }

      user.password = password; // Will be hashed by pre-save hook
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
      return res.status(500).json({ message: 'Server Error', error: err.message });
    }
  },
};