import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbGet, dbAll, dbRun } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const portfolioValidation = [
  body('src').isURL().withMessage('Source must be a valid URL'),
  body('alt').trim().isLength({ min: 1 }).withMessage('Alt text is required'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('width').isInt({ min: 1, max: 12 }).withMessage('Width must be between 1 and 12'),
  body('height').isInt({ min: 1, max: 12 }).withMessage('Height must be between 1 and 12')
];

// GET /api/portfolio - Get all portfolio items (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let sql = 'SELECT * FROM portfolio_items ORDER BY created_at DESC';
    let params = [];

    // Filter by category if provided and not 'all'
    if (category && category !== 'all') {
      sql = 'SELECT * FROM portfolio_items WHERE category = ? ORDER BY created_at DESC';
      params = [category];
    }

    const portfolioItems = await dbAll(sql, params);

    res.json({
      success: true,
      data: portfolioItems,
      count: portfolioItems.length
    });
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio items'
    });
  }
});

// GET /api/portfolio/:id - Get single portfolio item (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await dbGet(
      'SELECT * FROM portfolio_items WHERE id = ?',
      [req.params.id]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio item'
    });
  }
});

// POST /api/portfolio - Create new portfolio item (protected)
router.post('/', authenticateToken, portfolioValidation, async (req, res) => {
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

    const { src, alt, category, width, height } = req.body;

    // Verify category exists
    const categoryExists = await dbGet(
      'SELECT id FROM categories WHERE id = ?',
      [category]
    );

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    const result = await dbRun(
      'INSERT INTO portfolio_items (src, alt, category, width, height) VALUES (?, ?, ?, ?, ?)',
      [src, alt, category, width, height]
    );

    // Get the created item
    const newItem = await dbGet(
      'SELECT * FROM portfolio_items WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Portfolio item created successfully'
    });
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create portfolio item'
    });
  }
});

// PUT /api/portfolio/:id - Update portfolio item (protected)
router.put('/:id', authenticateToken, portfolioValidation, async (req, res) => {
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

    const { src, alt, category, width, height } = req.body;

    // Verify item exists
    const existingItem = await dbGet(
      'SELECT id FROM portfolio_items WHERE id = ?',
      [req.params.id]
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found'
      });
    }

    // Verify category exists
    const categoryExists = await dbGet(
      'SELECT id FROM categories WHERE id = ?',
      [category]
    );

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    await dbRun(
      'UPDATE portfolio_items SET src = ?, alt = ?, category = ?, width = ?, height = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [src, alt, category, width, height, req.params.id]
    );

    // Get the updated item
    const updatedItem = await dbGet(
      'SELECT * FROM portfolio_items WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: updatedItem,
      message: 'Portfolio item updated successfully'
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update portfolio item'
    });
  }
});

// DELETE /api/portfolio/:id - Delete portfolio item (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get item before deletion
    const item = await dbGet(
      'SELECT * FROM portfolio_items WHERE id = ?',
      [req.params.id]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found'
      });
    }

    await dbRun(
      'DELETE FROM portfolio_items WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: item,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete portfolio item'
    });
  }
});

export default router; 