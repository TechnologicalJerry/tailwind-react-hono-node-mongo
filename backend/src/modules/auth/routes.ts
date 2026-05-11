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
