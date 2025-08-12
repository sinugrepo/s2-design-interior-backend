import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbGet, dbAll, dbRun } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const testimonialsValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('quote').trim().isLength({ min: 10 }).withMessage('Quote must be at least 10 characters long'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
];

// GET /api/testimonials - Get all testimonials (public)
router.get('/', async (req, res) => {
  try {
    const { rating } = req.query;
    
    let sql = 'SELECT * FROM testimonials ORDER BY created_at DESC';
    let params = [];

    // Filter by minimum rating if provided
    if (rating) {
      sql = 'SELECT * FROM testimonials WHERE rating >= ? ORDER BY created_at DESC';
      params = [parseInt(rating)];
    }

    const testimonials = await dbAll(sql, params);

    res.json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testimonials'
    });
  }
});

// GET /api/testimonials/:id - Get single testimonial (public)
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await dbGet(
      'SELECT * FROM testimonials WHERE id = ?',
      [req.params.id]
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testimonial'
    });
  }
});

// POST /api/testimonials - Create new testimonial (protected)
router.post('/', authenticateToken, testimonialsValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, quote, rating, avatar } = req.body;

    // Set default avatar if not provided
    const avatarUrl = avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';

    const result = await dbRun(
      'INSERT INTO testimonials (name, quote, avatar, rating) VALUES (?, ?, ?, ?)',
      [name, quote, avatarUrl, rating]
    );

    // Get the created testimonial
    const newTestimonial = await dbGet(
      'SELECT * FROM testimonials WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      data: newTestimonial,
      message: 'Testimonial created successfully'
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create testimonial'
    });
  }
});

// PUT /api/testimonials/:id - Update testimonial (protected)
router.put('/:id', authenticateToken, testimonialsValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, quote, rating, avatar } = req.body;

    // Verify testimonial exists
    const existingTestimonial = await dbGet(
      'SELECT id FROM testimonials WHERE id = ?',
      [req.params.id]
    );

    if (!existingTestimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }

    // Set default avatar if not provided
    const avatarUrl = avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';

    await dbRun(
      'UPDATE testimonials SET name = ?, quote = ?, avatar = ?, rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, quote, avatarUrl, rating, req.params.id]
    );

    // Get the updated testimonial
    const updatedTestimonial = await dbGet(
      'SELECT * FROM testimonials WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: updatedTestimonial,
      message: 'Testimonial updated successfully'
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update testimonial'
    });
  }
});

// DELETE /api/testimonials/:id - Delete testimonial (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get testimonial before deletion
    const testimonial = await dbGet(
      'SELECT * FROM testimonials WHERE id = ?',
      [req.params.id]
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }

    await dbRun(
      'DELETE FROM testimonials WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: testimonial,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete testimonial'
    });
  }
});

export default router; 