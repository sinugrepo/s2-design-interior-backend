import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbGet, dbAll, dbRun } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const categoriesValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('slug').optional().trim().isLength({ min: 1 }).withMessage('Slug cannot be empty')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
];

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

// GET /api/categories - Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories ORDER BY created_at ASC');

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// GET /api/categories/:id - Get single category (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await dbGet(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    });
  }
});

// POST /api/categories - Create new category (protected)
router.post('/', authenticateToken, categoriesValidation, async (req, res) => {
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

    const { name } = req.body;
    let { slug } = req.body;

    // Auto-generate slug if not provided
    if (!slug) {
      slug = generateSlug(name);
    }

    // Check if slug already exists
    const existingCategory = await dbGet(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    );

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this slug already exists'
      });
    }

    await dbRun(
      'INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)',
      [slug, name, slug]
    );

    // Get the created category
    const newCategory = await dbGet(
      'SELECT * FROM categories WHERE id = ?',
      [slug]
    );

    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
});

// PUT /api/categories/:id - Update category (protected)
router.put('/:id', authenticateToken, categoriesValidation, async (req, res) => {
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

    // Prevent updating the 'all' category
    if (req.params.id === 'all') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update the "All" category'
      });
    }

    const { name } = req.body;
    let { slug } = req.body;

    // Verify category exists
    const existingCategory = await dbGet(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Auto-generate slug if not provided
    if (!slug) {
      slug = generateSlug(name);
    }

    // Check if new slug conflicts with existing categories (excluding current one)
    const conflictingCategory = await dbGet(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [slug, req.params.id]
    );

    if (conflictingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this slug already exists'
      });
    }

    // Update category
    await dbRun(
      'UPDATE categories SET name = ?, slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, slug, req.params.id]
    );

    // If slug changed, update the ID as well
    if (slug !== req.params.id) {
      // Update portfolio items that reference this category
      await dbRun(
        'UPDATE portfolio_items SET category = ? WHERE category = ?',
        [slug, req.params.id]
      );

      // Update the category ID
      await dbRun(
        'UPDATE categories SET id = ? WHERE id = ?',
        [slug, req.params.id]
      );
    }

    // Get the updated category
    const updatedCategory = await dbGet(
      'SELECT * FROM categories WHERE id = ?',
      [slug]
    );

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
});

// DELETE /api/categories/:id - Delete category (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Prevent deleting the 'all' category
    if (req.params.id === 'all') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the "All" category'
      });
    }

    // Get category before deletion
    const category = await dbGet(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category is used by portfolio items
    const portfolioCount = await dbGet(
      'SELECT COUNT(*) as count FROM portfolio_items WHERE category = ?',
      [req.params.id]
    );

    if (portfolioCount.count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category that is used by portfolio items'
      });
    }

    await dbRun(
      'DELETE FROM categories WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: category,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
});

export default router; 