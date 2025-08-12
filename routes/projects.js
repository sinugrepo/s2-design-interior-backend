import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbGet, dbAll, dbRun } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ===== PROJECT CATEGORIES ROUTES =====

// GET /api/projects/categories - Get all project categories (public)
router.get('/categories', async (req, res) => {
  try {
    // Get categories from dedicated categories table and from existing projects
    const dedicatedCategories = await dbAll('SELECT name FROM project_categories ORDER BY created_at ASC');
    const projectCategories = await dbAll('SELECT DISTINCT category as name FROM projects WHERE category IS NOT NULL ORDER BY category');
    
    // Combine and deduplicate categories
    const allCategories = [...dedicatedCategories, ...projectCategories];
    const uniqueCategories = [...new Set(allCategories.map(cat => cat.name))];
    
    res.json({
      success: true,
      data: uniqueCategories,
      count: uniqueCategories.length
    });
  } catch (error) {
    console.error('Error fetching project categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project categories'
    });
  }
});

// POST /api/projects/categories - Add new category (protected)
router.post('/categories', authenticateToken, [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name must be less than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name } = req.body;
    
    // Normalize category name to lowercase with hyphens for consistency
    const normalizedCategory = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category already exists in categories table or projects
    const existingInCategories = await dbGet(
      'SELECT name FROM project_categories WHERE LOWER(name) = LOWER(?) LIMIT 1',
      [normalizedCategory]
    );
    
    const existingInProjects = await dbGet(
      'SELECT category FROM projects WHERE LOWER(category) = LOWER(?) LIMIT 1',
      [normalizedCategory]
    );

    if (existingInCategories || existingInProjects) {
      return res.status(400).json({
        success: false,
        error: 'Category already exists'
      });
    }

    // Insert into project_categories table
    await dbRun(
      'INSERT INTO project_categories (name, display_name) VALUES (?, ?)',
      [normalizedCategory, name]
    );

    res.status(201).json({
      success: true,
      data: { 
        name: normalizedCategory,
        displayName: name
      },
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add category'
    });
  }
});

// PUT /api/projects/categories/:oldName - Update category name (protected)
router.put('/categories/:oldName', authenticateToken, [
  body('newName').trim().isLength({ min: 1 }).withMessage('New category name is required')
    .isLength({ max: 100 }).withMessage('Category name must be less than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { oldName } = req.params;
    const { newName } = req.body;

    // Check if old category exists
    const oldCategoryExists = await dbGet(
      'SELECT category FROM projects WHERE category = ? LIMIT 1',
      [oldName]
    );

    if (!oldCategoryExists) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if new category name already exists
    const newCategoryExists = await dbGet(
      'SELECT category FROM projects WHERE LOWER(category) = LOWER(?) AND category != ? LIMIT 1',
      [newName, oldName]
    );

    if (newCategoryExists) {
      return res.status(400).json({
        success: false,
        error: 'New category name already exists'
      });
    }

    // Update all projects with this category
    await dbRun(
      'UPDATE projects SET category = ? WHERE category = ?',
      [newName, oldName]
    );

    res.json({
      success: true,
      data: { oldName, newName },
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

// DELETE /api/projects/categories/:name - Delete category (protected)
router.delete('/categories/:name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.params;

    // Check if category exists and count projects using it
    const categoryProjects = await dbAll(
      'SELECT id FROM projects WHERE category = ?',
      [name]
    );

    // Always allow deletion, whether projects exist or not
    let affectedProjects = 0;
    
    if (categoryProjects.length > 0) {
      // Set category to null for all projects using this category
      await dbRun(
        'UPDATE projects SET category = NULL WHERE category = ?',
        [name]
      );
      affectedProjects = categoryProjects.length;
    }

    // IMPORTANT: Also remove from project_categories table
    await dbRun(
      'DELETE FROM project_categories WHERE name = ?',
      [name]
    );

    res.json({
      success: true,
      data: { 
        name, 
        affectedProjects: affectedProjects 
      },
      message: affectedProjects > 0 
        ? `Category deleted successfully. ${affectedProjects} projects now have no category.`
        : `Category deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
});

// POST /api/projects/categories/cleanup/:name - Cleanup category from project_categories table (protected)
router.post('/categories/cleanup/:name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.params;
    
    // Remove from project_categories table only
    const result = await dbRun(
      'DELETE FROM project_categories WHERE name = ?',
      [name]
    );

    res.json({
      success: true,
      data: { 
        name,
        deletedRows: result.changes 
      },
      message: `Category cleaned up from project_categories table. Deleted ${result.changes} rows.`
    });
  } catch (error) {
    console.error('Error cleaning up category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup category'
    });
  }
});

// ===== PROJECT ROUTES =====

// Validation middleware for projects
const projectValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('thumbnail_image').isURL().withMessage('Thumbnail image must be a valid URL'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('images.*.image_url').isURL().withMessage('Each image must have a valid URL'),
  body('images.*.alt_text').optional().trim(),
  body('images.*.display_order').isInt({ min: 1 }).withMessage('Display order must be a positive integer')
];

// GET /api/projects - Get all projects (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let sql = 'SELECT * FROM projects ORDER BY created_at DESC';
    let params = [];

    // Filter by category if provided
    if (category) {
      sql = 'SELECT * FROM projects WHERE category = ? ORDER BY created_at DESC';
      params = [category];
    }

    const projects = await dbAll(sql, params);

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

// GET /api/projects/:id - Get single project with images (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get project details
    const project = await dbGet(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Get project images
    const images = await dbAll(
      'SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC, created_at ASC',
      [id]
    );

    // Combine project data with images
    const projectWithImages = {
      ...project,
      images: images
    };

    res.json({
      success: true,
      data: projectWithImages
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
});

// POST /api/projects - Create new project (protected)
router.post('/', authenticateToken, projectValidation, async (req, res) => {
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

    const { title, description, category, thumbnail_image, images } = req.body;

    // Insert project
    const result = await dbRun(
      'INSERT INTO projects (title, description, category, thumbnail_image) VALUES (?, ?, ?, ?)',
      [title, description || '', category, thumbnail_image]
    );

    const projectId = result.id;

    // Insert project images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      await dbRun(
        'INSERT INTO project_images (project_id, image_url, alt_text, display_order) VALUES (?, ?, ?, ?)',
        [projectId, image.image_url, image.alt_text || '', image.display_order || i]
      );
    }

    // Get the created project with images
    const newProject = await dbGet(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );

    const projectImages = await dbAll(
      'SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC',
      [projectId]
    );

    res.status(201).json({
      success: true,
      data: {
        ...newProject,
        images: projectImages
      },
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

// PUT /api/projects/:id - Update project (protected)
router.put('/:id', authenticateToken, projectValidation, async (req, res) => {
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

    const { id } = req.params;
    const { title, description, category, thumbnail_image, images } = req.body;

    // Verify project exists
    const existingProject = await dbGet(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Update project
    await dbRun(
      'UPDATE projects SET title = ?, description = ?, category = ?, thumbnail_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description || '', category, thumbnail_image, id]
    );

    // Delete existing images
    await dbRun('DELETE FROM project_images WHERE project_id = ?', [id]);

    // Insert new images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      await dbRun(
        'INSERT INTO project_images (project_id, image_url, alt_text, display_order) VALUES (?, ?, ?, ?)',
        [id, image.image_url, image.alt_text || '', image.display_order || i]
      );
    }

    // Get updated project with images
    const updatedProject = await dbGet(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    const projectImages = await dbAll(
      'SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...updatedProject,
        images: projectImages
      },
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
});

// DELETE /api/projects/:id - Delete project (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify project exists
    const existingProject = await dbGet(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Delete project (images will be deleted automatically due to CASCADE)
    await dbRun('DELETE FROM projects WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

export default router; 