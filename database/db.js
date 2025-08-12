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

      // Categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Portfolio items table
      db.run(`
        CREATE TABLE IF NOT EXISTS portfolio_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          src TEXT NOT NULL,
          alt TEXT NOT NULL,
          category TEXT NOT NULL,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category) REFERENCES categories (id)
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
  // Default categories
  const categories = [
    { id: 'all', name: 'All', slug: 'all' },
    { id: 'living-room', name: 'Living Room', slug: 'living-room' },
    { id: 'kitchen', name: 'Kitchen', slug: 'kitchen' },
    { id: 'bedroom', name: 'Bedroom', slug: 'bedroom' },
    { id: 'dining-room', name: 'Dining Room', slug: 'dining-room' },
    { id: 'office', name: 'Office', slug: 'office' },
    { id: 'bathroom', name: 'Bathroom', slug: 'bathroom' }
  ];

  // Insert categories first
  let categoriesInserted = 0;
  categories.forEach(category => {
    db.run(
      `INSERT OR IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)`,
      [category.id, category.name, category.slug],
      (err) => {
        if (!err) {
          categoriesInserted++;
          // Once all categories are inserted, insert other data
          if (categoriesInserted === categories.length) {
            insertTestimonials();
            insertPortfolioItems();
          }
        }
      }
    );
  });
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

// Insert portfolio items
const insertPortfolioItems = () => {
  // Default portfolio items
  const portfolioItems = [
    
    // New portfolio items from R2 CDN
    // Bedroom category - Portrait ratios with variations
    { src: 'https://sinug.my.id/bedroom.jpg', alt: 'Modern Bedroom Design 1', category: 'bedroom', width: 6, height: 8 },
    { src: 'https://sinug.my.id/bedroom2.jpg', alt: 'Contemporary Bedroom Design 2', category: 'bedroom', width: 7, height: 10 },
    { src: 'https://sinug.my.id/bedroom3.jpg', alt: 'Elegant Bedroom Design 3', category: 'bedroom', width: 5, height: 7 },
    { src: 'https://sinug.my.id/bedroom4.jpg', alt: 'Minimalist Bedroom Design 4', category: 'bedroom', width: 8, height: 10 },
    { src: 'https://sinug.my.id/bedroom5.jpg', alt: 'Luxurious Bedroom Design 5', category: 'bedroom', width: 6, height: 9 },
    { src: 'https://sinug.my.id/bedroom6.jpg', alt: 'Sophisticated Bedroom Design 6', category: 'bedroom', width: 5, height: 8 },
    { src: 'https://sinug.my.id/bedroom7.jpg', alt: 'Stylish Bedroom Design 7', category: 'bedroom', width: 7, height: 9 },
    
    // Dining Room category - Portrait ratios
    { src: 'https://sinug.my.id/diningroom.jpg', alt: 'Elegant Dining Room Design', category: 'dining-room', width: 6, height: 8 },
    { src: 'https://sinug.my.id/diningroom1.jpg', alt: 'Contemporary Dining Room Design', category: 'dining-room', width: 7, height: 10 },
    
    // Living Room category (family room mapped to living room) - Portrait ratios
    { src: 'https://sinug.my.id/familyroom.jpg', alt: 'Cozy Family Room Design', category: 'living-room', width: 5, height: 7 },
    { src: 'https://sinug.my.id/familyroom2.jpg', alt: 'Modern Family Room Design 2', category: 'living-room', width: 8, height: 10 },
    { src: 'https://sinug.my.id/familyroom3.jpg', alt: 'Comfortable Family Room Design 3', category: 'living-room', width: 6, height: 9 },
    { src: 'https://sinug.my.id/familyroom4.jpg', alt: 'Spacious Family Room Design 4', category: 'living-room', width: 5, height: 8 },
    
    // Kitchen category - Portrait ratios
    { src: 'https://sinug.my.id/kitchen1.jpg', alt: 'Modern Kitchen Design 1', category: 'kitchen', width: 7, height: 9 },
    { src: 'https://sinug.my.id/kitchen2.jpg', alt: 'Contemporary Kitchen Design 2', category: 'kitchen', width: 6, height: 8 },
    { src: 'https://sinug.my.id/kitchen3.jpg', alt: 'Elegant Kitchen Design 3', category: 'kitchen', width: 8, height: 10 },
    { src: 'https://sinug.my.id/kitchen4.jpg', alt: 'Minimalist Kitchen Design 4', category: 'kitchen', width: 5, height: 7 },
    { src: 'https://sinug.my.id/kitchen5.jpg', alt: 'Luxurious Kitchen Design 5', category: 'kitchen', width: 6, height: 9 },
    
    // Living Room category - Portrait ratios
    { src: 'https://sinug.my.id/livingroom.jpg', alt: 'Stylish Living Room Design', category: 'living-room', width: 7, height: 10 },
    { src: 'https://sinug.my.id/livingroom1.jpg', alt: 'Modern Living Room Design 1', category: 'living-room', width: 5, height: 8 },
    { src: 'https://sinug.my.id/livingroom2.jpg', alt: 'Contemporary Living Room Design 2', category: 'living-room', width: 6, height: 8 },
    { src: 'https://sinug.my.id/livingroom3.jpg', alt: 'Elegant Living Room Design 3', category: 'living-room', width: 8, height: 10 },
    { src: 'https://sinug.my.id/livingroom4.jpg', alt: 'Sophisticated Living Room Design 4', category: 'living-room', width: 7, height: 9 },
    
    // Office category - Portrait ratio
    { src: 'https://sinug.my.id/office1.jpg', alt: 'Modern Office Design 1', category: 'office', width: 6, height: 9 }
  ];

  portfolioItems.forEach(item => {
    db.run(
      `INSERT OR IGNORE INTO portfolio_items (src, alt, category, width, height) VALUES (?, ?, ?, ?, ?)`,
      [item.src, item.alt, item.category, item.width, item.height]
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