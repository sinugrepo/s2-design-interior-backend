import sqlite3 from 'sqlite3';
import { config } from '../config.js';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database(config.database.path);

console.log('Starting database migration...');

db.serialize(() => {
  // Check if email column exists
  db.get("PRAGMA table_info(users)", (err, result) => {
    if (err) {
      console.error('Error checking table info:', err);
      return;
    }

    // Add email column if it doesn't exist
    db.run("ALTER TABLE users ADD COLUMN email TEXT", (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding email column:', err);
        return;
      }
      
      if (!err) {
        console.log('Added email column to users table');
        
        // Update existing admin user with email
        db.run(
          "UPDATE users SET email = ? WHERE username = ?",
          ['admin@s2design.com', 'admin'],
          (err) => {
            if (err) {
              console.error('Error updating admin email:', err);
            } else {
              console.log('Updated admin user with email');
            }
          }
        );
      } else {
        console.log('Email column already exists');
      }
    });

    // Create password reset tokens table
    db.run(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating password_reset_tokens table:', err);
      } else {
        console.log('Created password_reset_tokens table');
      }
      
      console.log('Migration completed!');
      db.close();
    });
  });
});
