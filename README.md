# S2 Design Interior - Backend API v2.0.0

A complete RESTful API with authentication for managing portfolio items, testimonials, and categories for the S2 Design Interior website.

## 🚀 Features

- **🔐 JWT Authentication**: Secure admin login system
- **📊 SQLite Database**: Lightweight, file-based database
- **🖼️ Portfolio Management**: Full CRUD operations for portfolio items
- **💬 Testimonials Management**: Complete testimonial system with ratings
- **📂 Categories Management**: Dynamic category system for organizing content
- **✅ Data Validation**: Comprehensive input validation using express-validator
- **🛡️ Security**: Helmet.js for security headers, CORS enabled, JWT token protection
- **📊 Logging**: Morgan logging for request monitoring
- **🚀 Modern ES6**: Uses ES modules and modern JavaScript features

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **ES6 Modules** - Modern module system
- **express-validator** - Input validation

## 📦 Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   Or start production server:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3001`

## 🗄️ Database

The application uses **SQLite** for data storage:

- **File**: `backend/database.sqlite` (auto-created)
- **Schema**: Available in `backend/database/schema.sql`
- **Auto-initialization**: Database and tables are created automatically on first run

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 🔐 Authentication

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Protected Routes
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📚 API Endpoints

### 🔓 Public Endpoints (No Authentication Required)

#### Health Check
- `GET /api/health` - API health status

#### Portfolio (Read-only)
- `GET /api/portfolio` - Get all portfolio items
- `GET /api/portfolio/:id` - Get single portfolio item

#### Testimonials (Read-only)
- `GET /api/testimonials` - Get all testimonials
- `GET /api/testimonials/:id` - Get single testimonial

#### Categories (Read-only)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category

### 🔒 Protected Endpoints (Authentication Required)

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify token

#### Portfolio Management
- `POST /api/portfolio` - Create new portfolio item
- `PUT /api/portfolio/:id` - Update portfolio item
- `DELETE /api/portfolio/:id` - Delete portfolio item

#### Testimonials Management
- `POST /api/testimonials` - Create new testimonial
- `PUT /api/testimonials/:id` - Update testimonial
- `DELETE /api/testimonials/:id` - Delete testimonial

#### Categories Management
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 📋 Data Schemas

### Portfolio Item
```json
{
  "id": 1,
  "src": "https://example.com/image.jpg",
  "alt": "Beautiful living room",
  "category": "living-room",
  "width": 4,
  "height": 3,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Testimonial
```json
{
  "id": 1,
  "name": "John Doe",
  "quote": "Amazing work! Highly recommended.",
  "avatar": "https://example.com/avatar.jpg",
  "rating": 5,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Category
```json
{
  "id": "living-room",
  "name": "Living Room",
  "slug": "living-room",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Query Parameters

### Portfolio
- `category` - Filter by category (e.g., `?category=living-room`)

### Testimonials
- `rating` - Filter by minimum rating (e.g., `?rating=4`)

## 📝 Example Usage

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Create Portfolio Item (Protected)
```bash
curl -X POST http://localhost:3001/api/portfolio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "src": "https://example.com/image.jpg",
    "alt": "Beautiful living room",
    "category": "living-room",
    "width": 4,
    "height": 3
  }'
```

### Create Testimonial (Protected)
```bash
curl -X POST http://localhost:3001/api/testimonials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "quote": "Amazing work! Highly recommended.",
    "rating": 5,
    "avatar": "https://example.com/avatar.jpg"
  }'
```

## 🗄️ Database Migration

If you prefer to use MySQL or PostgreSQL instead of SQLite:

1. Install the appropriate database driver:
   ```bash
   npm install mysql2  # for MySQL
   # or
   npm install pg      # for PostgreSQL
   ```

2. Update the database configuration in `config.js`
3. Use the SQL schema in `backend/database/schema.sql`

## 🔧 Configuration

Environment variables (or update `config.js`):

```bash
PORT=3001
DATABASE_PATH=./database.sqlite
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 🚦 Error Handling

The API includes comprehensive error handling:
- **400 Bad Request** - Validation errors or malformed requests
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Valid token but insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server errors

## 🔒 Security Features

- **JWT Authentication** - Stateless token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configured for cross-origin requests
- **Input Validation** - All inputs are validated and sanitized
- **SQL Injection Protection** - Parameterized queries
- **Error Sanitization** - Sensitive error details are not exposed

## 📊 Performance Features

- **Database Indexes** - Optimized queries for better performance
- **Efficient Queries** - Minimal database calls
- **Caching Headers** - Proper HTTP caching for static content

## 🚀 Deployment

### Production Setup

1. Change default admin credentials
2. Use strong JWT secret
3. Enable HTTPS
4. Set up proper database backups
5. Configure environment variables
6. Use process manager (PM2)

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📄 License

ISC 