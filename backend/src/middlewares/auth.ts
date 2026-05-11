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
