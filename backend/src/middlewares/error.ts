import { Context } from 'hono';

export const errorHandler = (err: any, c: Context) => {
  console.error(err);
  return c.json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || null
  }, err.status || 500);
};
