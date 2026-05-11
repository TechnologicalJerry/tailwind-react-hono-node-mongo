import { serve } from '@hono/node-server';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

connectDB().then(() => {
  serve({
    fetch: app.fetch,
    port: env.PORT,
  }, (info) => {
    console.log(`Server running at http://localhost:${info.port}`);
  });
}).catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});
