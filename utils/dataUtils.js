import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'data');

// Ensure data directory exists
export const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Read JSON data from file
export const readDataFile = async (filename) => {
  try {
    const filePath = join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
};

// Write JSON data to file
export const writeDataFile = async (filename, data) => {
  await ensureDataDir();
  const filePath = join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Generate unique ID
export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// Validate required fields
export const validateRequiredFields = (data, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${field} is required`);
    }
  }
  
  return errors;
};

// Sanitize data by removing undefined/null values
export const sanitizeData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}; 