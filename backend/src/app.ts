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
