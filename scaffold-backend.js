const fs = require('fs');
const path = require('path');

function createFiles(baseDir, structure) {
    for (const [key, value] of Object.entries(structure)) {
        const fullPath = path.join(baseDir, key);
        if (typeof value === 'string') {
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            fs.writeFileSync(fullPath, value.trim() + '\n', 'utf-8');
        } else {
            fs.mkdirSync(fullPath, { recursive: true });
            createFiles(fullPath, value);
        }
    }
}

const backendStructure = {
    'package.json': `
{
  "name": "backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@hono/node-server": "^1.13.7",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "hono": "^4.6.12",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.8.4",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.10.1",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
    `,
    'tsconfig.json': `
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
    `,
    '.env.example': `
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hono-app
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
CLIENT_URL=http://localhost:3000
    `,
    'src/server.ts': `
import { serve } from '@hono/node-server';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

connectDB().then(() => {
  serve({
    fetch: app.fetch,
    port: env.PORT,
  }, (info) => {
    console.log(\`Server running at http://localhost:\${info.port}\`);
  });
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});
    `,
    'src/app.ts': `
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middlewares/error';
import { env } from './config/env';

// Routes imports
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import productRoutes from './modules/products/routes';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

app.get('/', (c) => c.json({ success: true, message: 'API is running' }));

app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/products', productRoutes);

app.onError(errorHandler);

export default app;
    `,
    'src/config/env.ts': `
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hono-app',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};
    `,
    'src/config/db.ts': `
import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
    `,
    'src/utils/response.ts': `
export const sendResponse = (c: any, status: number, message: string, data?: any) => {
  return c.json({
    success: status >= 200 && status < 300,
    message,
    data
  }, status);
};
    `,
    'src/middlewares/error.ts': `
import { Context } from 'hono';

export const errorHandler = (err: any, c: Context) => {
  console.error(err);
  return c.json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || null
  }, err.status || 500);
};
    `,
    'src/middlewares/auth.ts': `
import { Context, Next } from 'hono';
import { verify } from 'jsonwebtoken';
import { env } from '../config/env';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verify(token, env.JWT_ACCESS_SECRET) as any;
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ success: false, message: 'Invalid or expired token' }, 401);
  }
};

export const roleMiddleware = (roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      return c.json({ success: false, message: 'Forbidden' }, 403);
    }
    await next();
  };
};
    `,
    'src/modules/users/model.ts': `
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  avatar?: string;
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
    `,
    'src/modules/products/model.ts': `
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  createdBy: mongoose.Types.ObjectId;
}

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Product = mongoose.model<IProduct>('Product', productSchema);
    `,
    'src/modules/auth/validation.ts': `
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});
    `,
    'src/modules/auth/routes.ts': `
import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../users/model';
import { registerSchema, loginSchema } from './validation';
import { env } from '../../config/env';
import { sendResponse } from '../../utils/response';
import { authMiddleware } from '../../middlewares/auth';

const authRoutes = new Hono();

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, password } = c.req.valid('json');
  const existingUser = await User.findOne({ email });
  if (existingUser) return c.json({ success: false, message: 'Email already in use' }, 400);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  
  return sendResponse(c, 201, 'User registered successfully', { id: user._id, name: user.name, email: user.email });
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const user = await User.findOne({ email });
  if (!user) return c.json({ success: false, message: 'Invalid credentials' }, 401);

  const isMatch = await bcrypt.compare(password, user.password as string);
  if (!isMatch) return c.json({ success: false, message: 'Invalid credentials' }, 401);

  const payload = { id: user._id, role: user.role };
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES });

  setCookie(c, 'refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  });

  return sendResponse(c, 200, 'Login successful', { accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

authRoutes.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refreshToken');
  if (!refreshToken) return c.json({ success: false, message: 'Refresh token not found' }, 401);

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
    const user = await User.findById(decoded.id);
    if (!user) return c.json({ success: false, message: 'User not found' }, 401);

    const accessToken = jwt.sign({ id: user._id, role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES });
    return sendResponse(c, 200, 'Token refreshed', { accessToken });
  } catch (err) {
    return c.json({ success: false, message: 'Invalid refresh token' }, 401);
  }
});

authRoutes.post('/logout', async (c) => {
  deleteCookie(c, 'refreshToken', { path: '/' });
  return sendResponse(c, 200, 'Logged out successfully');
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const reqUser = c.get('user');
  const user = await User.findById(reqUser.id).select('-password');
  if (!user) return c.json({ success: false, message: 'User not found' }, 404);
  return sendResponse(c, 200, 'Current user', { user });
});

export default authRoutes;
    `,
    'src/modules/users/routes.ts': `
import { Hono } from 'hono';
import { User } from './model';
import { sendResponse } from '../../utils/response';
import { authMiddleware, roleMiddleware } from '../../middlewares/auth';

const userRoutes = new Hono();

userRoutes.use('*', authMiddleware);

userRoutes.get('/', roleMiddleware(['admin']), async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const search = c.req.query('search') || '';
  const skip = (page - 1) * limit;

  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const users = await User.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = await User.countDocuments(query);

  return sendResponse(c, 200, 'Users fetched', { users, total, page, totalPages: Math.ceil(total / limit) });
});

userRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const reqUser = c.get('user');
  
  if (reqUser.role !== 'admin' && reqUser.id !== id) {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }

  const user = await User.findById(id).select('-password');
  if (!user) return c.json({ success: false, message: 'User not found' }, 404);
  
  return sendResponse(c, 200, 'User fetched', { user });
});

userRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const reqUser = c.get('user');
  
  if (reqUser.role !== 'admin' && reqUser.id !== id) {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }

  const body = await c.req.json();
  // Prevent role escalation by normal users
  if (reqUser.role !== 'admin') delete body.role;
  if (body.password) delete body.password; // Handle password change separately

  const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');
  return sendResponse(c, 200, 'User updated', { user });
});

userRoutes.delete('/:id', roleMiddleware(['admin']), async (c) => {
  const id = c.req.param('id');
  await User.findByIdAndDelete(id);
  return sendResponse(c, 200, 'User deleted');
});

export default userRoutes;
    `,
    'src/modules/products/routes.ts': `
import { Hono } from 'hono';
import { Product } from './model';
import { sendResponse } from '../../utils/response';
import { authMiddleware, roleMiddleware } from '../../middlewares/auth';

const productRoutes = new Hono();

productRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const search = c.req.query('search') || '';
  const category = c.req.query('category') || '';
  const skip = (page - 1) * limit;

  const query: any = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (category) query.category = category;

  const products = await Product.find(query).populate('createdBy', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = await Product.countDocuments(query);

  return sendResponse(c, 200, 'Products fetched', { products, total, page, totalPages: Math.ceil(total / limit) });
});

productRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const product = await Product.findById(id).populate('createdBy', 'name email');
  if (!product) return c.json({ success: false, message: 'Product not found' }, 404);
  return sendResponse(c, 200, 'Product fetched', { product });
});

productRoutes.use('*', authMiddleware);

productRoutes.post('/', async (c) => {
  const reqUser = c.get('user');
  const body = await c.req.json();
  const product = await Product.create({ ...body, createdBy: reqUser.id });
  return sendResponse(c, 201, 'Product created', { product });
});

productRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const reqUser = c.get('user');
  const product = await Product.findById(id);
  
  if (!product) return c.json({ success: false, message: 'Product not found' }, 404);
  if (reqUser.role !== 'admin' && product.createdBy.toString() !== reqUser.id) {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }

  const body = await c.req.json();
  const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });
  return sendResponse(c, 200, 'Product updated', { product: updatedProduct });
});

productRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const reqUser = c.get('user');
  const product = await Product.findById(id);
  
  if (!product) return c.json({ success: false, message: 'Product not found' }, 404);
  if (reqUser.role !== 'admin' && product.createdBy.toString() !== reqUser.id) {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }

  await Product.findByIdAndDelete(id);
  return sendResponse(c, 200, 'Product deleted');
});

export default productRoutes;
    `
};

createFiles(path.join(__dirname, 'backend'), backendStructure);
console.log('Backend generated');
