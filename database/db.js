import sqlite3 from 'sqlite3';
import { config } from '../config.js';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database(config.database.path);

// Enable foreign key constraints
db.run("PRAGMA foreign_keys = ON");

// Initialize database tables
export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table for admin authentication
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Projects table (main focus now)
      db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          thumbnail_image TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Project categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS project_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Project images table
      db.run(`
        CREATE TABLE IF NOT EXISTS project_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER NOT NULL,
          image_url TEXT NOT NULL,
          alt_text TEXT,
          display_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);

      // Legacy portfolio items table (keep for now)
      db.run(`
        CREATE TABLE IF NOT EXISTS portfolio_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          src TEXT NOT NULL,
          alt TEXT NOT NULL,
          category TEXT NOT NULL,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Testimonials table
      db.run(`
        CREATE TABLE IF NOT EXISTS testimonials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          quote TEXT NOT NULL,
          avatar TEXT,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create default admin user
      const hashedPassword = bcrypt.hashSync(config.admin.password, 10);
      db.run(
        `INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
        [config.admin.username, hashedPassword, 'admin'],
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database initialized successfully');
            insertDefaultData();
            resolve();
          }
        }
      );
    });
  });
};

// Insert default data
const insertDefaultData = () => {
  insertDefaultCategories();
  insertTestimonials();
  insertSampleProjects();
};

// Insert testimonials
const insertTestimonials = () => {
  // Default testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      quote: 'S2 Design Interior transformed our home into a masterpiece. Their attention to detail and modern aesthetic exceeded our expectations.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      name: 'Michael Chen',
      quote: 'Professional, creative, and reliable. They turned our vision into reality while staying within budget. Highly recommended!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      quote: 'The team at S2 Design Interior has an incredible eye for design. Our office space now inspires creativity and productivity.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      name: 'David Thompson',
      quote: 'From concept to completion, the process was seamless. They understood our style perfectly and delivered beyond our dreams.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      name: 'Lisa Wang',
      quote: 'Amazing work on our kitchen renovation! The space is both beautiful and functional. We love spending time cooking and entertaining now.',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&q=80',
      rating: 5
    }
  ];

  testimonials.forEach(testimonial => {
    db.run(
      `INSERT OR IGNORE INTO testimonials (name, quote, avatar, rating) VALUES (?, ?, ?, ?)`,
      [testimonial.name, testimonial.quote, testimonial.avatar, testimonial.rating]
    );
  });
};

// Insert default project categories
const insertDefaultCategories = () => {
  const defaultCategories = [
    { name: 'office', displayName: 'Office' },
    { name: 'residential', displayName: 'Residential' },
    { name: 'apartment', displayName: 'Apartment' },
    { name: 'public-space', displayName: 'Public Space' }
  ];

  defaultCategories.forEach(category => {
    db.run(
      `INSERT OR IGNORE INTO project_categories (name, display_name) VALUES (?, ?)`,
      [category.name, category.displayName]
    );
  });
};

// Insert sample projects
const insertSampleProjects = () => {
  // Sample projects for the new structure
  const sampleProjects = [
    {
      title: 'Modern City Office Complex',
      description: 'A contemporary office space design that promotes productivity and collaboration with open-plan layouts and modern amenities.',
      category: 'office',
      thumbnail_image: 'https://sinug.my.id/office1.jpg',
      images: [
        { url: 'https://sinug.my.id/office1.jpg', alt: 'Modern Office Reception Area', order: 1 },
        { url: 'https://sinug.my.id/office2.jpg', alt: 'Open Plan Workspace', order: 2 },
        { url: 'https://sinug.my.id/office3.jpg', alt: 'Executive Meeting Room', order: 3 }
      ]
    },
    {
      title: 'Luxury Residential Villa',
      description: 'An elegant residential design featuring sophisticated living spaces with premium materials and custom furnishings.',
      category: 'residential',
      thumbnail_image: 'https://sinug.my.id/livingroom.jpg',
      images: [
        { url: 'https://sinug.my.id/livingroom.jpg', alt: 'Grand Living Room', order: 1 },
        { url: 'https://sinug.my.id/livingroom1.jpg', alt: 'Elegant Sitting Area', order: 2 },
        { url: 'https://sinug.my.id/bedroom.jpg', alt: 'Master Bedroom Suite', order: 3 },
        { url: 'https://sinug.my.id/kitchen1.jpg', alt: 'Gourmet Kitchen', order: 4 }
      ]
    },
    {
      title: 'Modern Downtown Apartment',
      description: 'A stylish urban apartment design maximizing space efficiency while maintaining luxury and comfort.',
      category: 'apartment',
      thumbnail_image: 'https://sinug.my.id/familyroom.jpg',
      images: [
        { url: 'https://sinug.my.id/familyroom.jpg', alt: 'Open Living Area', order: 1 },
        { url: 'https://sinug.my.id/kitchen2.jpg', alt: 'Compact Modern Kitchen', order: 2 },
        { url: 'https://sinug.my.id/bedroom2.jpg', alt: 'Contemporary Bedroom', order: 3 }
      ]
    },
    {
      title: 'City Shopping Mall Interior',
      description: 'A vibrant public space design creating an engaging shopping experience with modern retail environments.',
      category: 'public-space',
      thumbnail_image: 'https://sinug.my.id/diningroom.jpg',
      images: [
        { url: 'https://sinug.my.id/diningroom.jpg', alt: 'Main Concourse Area', order: 1 },
        { url: 'https://sinug.my.id/diningroom1.jpg', alt: 'Food Court Design', order: 2 }
      ]
    },
    {
      title: 'Corporate Headquarters',
      description: 'A prestigious office design for a leading corporation featuring executive offices and collaborative spaces.',
      category: 'office',
      thumbnail_image: 'https://sinug.my.id/office2.jpg',
      images: [
        { url: 'https://sinug.my.id/office2.jpg', alt: 'Executive Office Suite', order: 1 },
        { url: 'https://sinug.my.id/office3.jpg', alt: 'Conference Center', order: 2 }
      ]
    },
    {
      title: 'Contemporary Family Home',
      description: 'A warm and inviting residential design perfect for modern family living with functional and beautiful spaces.',
      category: 'residential',
      thumbnail_image: 'https://sinug.my.id/familyroom2.jpg',
      images: [
        { url: 'https://sinug.my.id/familyroom2.jpg', alt: 'Family Living Room', order: 1 },
        { url: 'https://sinug.my.id/familyroom3.jpg', alt: 'Cozy Reading Nook', order: 2 },
        { url: 'https://sinug.my.id/kitchen3.jpg', alt: 'Family Kitchen', order: 3 },
        { url: 'https://sinug.my.id/bedroom3.jpg', alt: 'Children\'s Bedroom', order: 4 }
      ]
    }
  ];

  // Insert projects
  sampleProjects.forEach(project => {
    db.run(
      `INSERT OR IGNORE INTO projects (title, description, category, thumbnail_image) VALUES (?, ?, ?, ?)`,
      [project.title, project.description, project.category, project.thumbnail_image],
      function(err) {
        if (!err && this.lastID) {
          // Insert project images
          project.images.forEach(image => {
            db.run(
              `INSERT INTO project_images (project_id, image_url, alt_text, display_order) VALUES (?, ?, ?, ?)`,
              [this.lastID, image.url, image.alt, image.order]
            );
          });
        }
      }
    );
  });
};

// Database helpers
export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export default db; 