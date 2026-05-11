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
