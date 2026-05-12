import { Hono } from 'hono';
import { User } from './model';
import { sendResponse } from '../../utils/response';
import { authMiddleware, roleMiddleware } from '../../middlewares/auth';

type Variables = {
  user: any;
};

const userRoutes = new Hono<{ Variables: Variables }>();

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
