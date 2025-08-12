import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { initializeDatabase } from './database/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import testimonialsRoutes from './routes/testimonials.js';
import categoriesRoutes from './routes/categories.js';

const app = express();
const PORT = config.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database
try {
  await initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/categories', categoriesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'S2 Design Backend API is running',
    timestamp: new Date().toISOString(),
    database: 'SQLite',
    version: '2.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: 'The requested resource was not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: 'Something went wrong on the server' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 S2 Design Backend API v2.0.0 is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth/login`);
  console.log(`🖼️  Projects API: http://localhost:${PORT}/api/projects`);
  console.log(`📂 Project Categories: http://localhost:${PORT}/api/projects/categories`);
  console.log(`💬 Testimonials API: http://localhost:${PORT}/api/testimonials`);
  console.log(`\n📋 Admin Credentials:`);
  console.log(`   Username: ${config.admin.username}`);
  console.log(`   Password: ${config.admin.password}`);
}); 