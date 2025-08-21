-- S2 Design Interior Database Schema
-- Compatible with SQLite, MySQL, PostgreSQL

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens table for OTP functionality
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Projects table (main focus now)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    thumbnail_image TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project images table (multiple images per project)
CREATE TABLE IF NOT EXISTS project_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Legacy portfolio items table (keep for data migration)
CREATE TABLE IF NOT EXISTS portfolio_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src TEXT NOT NULL,
    alt VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    quote TEXT NOT NULL,
    avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
-- Note: In production, use a stronger password and hash it properly
INSERT OR IGNORE INTO users (username, email, password, role) VALUES
    ('admin', 'admin@s2design.com', '$2a$10$rOzJmZKz.9GF5B5B5B5B5OuJ5B5B5B5B5B5B5B5B5B5B5B5B5B5B5', 'admin');

-- Insert sample portfolio items
INSERT OR IGNORE INTO portfolio_items (src, alt, category, width, height) VALUES
    ('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80', 'Modern Living Room Design', 'living-room', 4, 3),
    ('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80', 'Contemporary Kitchen Interior', 'kitchen', 3, 4),
    ('https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1000&q=80', 'Elegant Bedroom Design', 'bedroom', 4, 3),
    ('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80', 'Minimalist Dining Room', 'dining-room', 3, 4),
    -- New portfolio items from R2 CDN
    -- Bedroom category
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/bedroom1.jpg', 'Modern Bedroom Design 1', 'bedroom', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/bedroom2.jpg', 'Contemporary Bedroom Design 2', 'bedroom', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/bedroom3.jpg', 'Elegant Bedroom Design 3', 'bedroom', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/bedroom4.jpg', 'Minimalist Bedroom Design 4', 'bedroom', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/bedroom5.jpg', 'Luxurious Bedroom Design 5', 'bedroom', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/bedroom6.jpg', 'Sophisticated Bedroom Design 6', 'bedroom', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/bedroom7.jpg', 'Stylish Bedroom Design 7', 'bedroom', 4, 3),
    -- Dining Room category
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/diningroom.jpg', 'Elegant Dining Room Design', 'dining-room', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/diningroom1.jpg', 'Contemporary Dining Room Design', 'dining-room', 4, 3),
    -- Living Room category (family room mapped to living room)
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/familyroom.jpg', 'Cozy Family Room Design', 'living-room', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/familyroom2.jpg', 'Modern Family Room Design 2', 'living-room', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/familyroom3.jpg', 'Comfortable Family Room Design 3', 'living-room', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/familyroom4.jpg', 'Spacious Family Room Design 4', 'living-room', 4, 3),
    -- Kitchen category
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/kitchen1.jpg', 'Modern Kitchen Design 1', 'kitchen', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/kitchen2.jpg', 'Contemporary Kitchen Design 2', 'kitchen', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/kitchen3.jpg', 'Elegant Kitchen Design 3', 'kitchen', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/kitchen4.jpg', 'Minimalist Kitchen Design 4', 'kitchen', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/kitchen5.jpg', 'Luxurious Kitchen Design 5', 'kitchen', 4, 3),
    -- Living Room category
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/livingroom.jpg', 'Stylish Living Room Design', 'living-room', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/livingroom1.jpg', 'Modern Living Room Design 1', 'living-room', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/livingroom2.jpg', 'Contemporary Living Room Design 2', 'living-room', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/livingroom3.jpg', 'Elegant Living Room Design 3', 'living-room', 4, 3),
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/livingroom4.jpg', 'Sophisticated Living Room Design 4', 'living-room', 4, 3),
    -- Office category
    ('https://pub-4b726d609a0b4194a50bf88419fd0b9a.r2.dev/office1.jpg', 'Modern Office Design 1', 'office', 4, 3);

-- Insert sample testimonials
INSERT OR IGNORE INTO testimonials (name, quote, avatar, rating) VALUES
    ('Sarah Johnson', 'S2 Design Interior transformed our home into a masterpiece. Their attention to detail and modern aesthetic exceeded our expectations.', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80', 5),
    ('Michael Chen', 'Professional, creative, and reliable. They turned our vision into reality while staying within budget. Highly recommended!', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 5),
    ('Emily Rodriguez', 'The team at S2 Design Interior has an incredible eye for design. Our office space now inspires creativity and productivity.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', 5),
    ('David Thompson', 'From concept to completion, the process was seamless. They understood our style perfectly and delivered beyond our dreams.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', 5);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio_items(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at); 