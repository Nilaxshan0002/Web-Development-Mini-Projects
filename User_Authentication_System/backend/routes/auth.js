const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ============================================
router.post('/register', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be 3-20 characters'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Create user
        const user = new User({ username, email, password });
        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ============================================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ============================================
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ============================================
// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
// ============================================
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ============================================
// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
// ============================================
router.post('/logout', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// ============================================
// @route   GET /api/auth/admin-only
// @desc    Admin only route
// @access  Private/Admin
// ============================================
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'You have admin access!',
        user: req.user
    });
});

module.exports = router;