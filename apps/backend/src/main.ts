// apps/backend/src/main.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/backend/.env' });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import { userRoutes } from './app/users/user.route';
import { productRoutes } from './app/products/product.route';
import { uploadRoutes } from './app/upload/upload.routes';
import { cartRoutes } from './app/cart/cart.routes';
import { orderRoutes } from './app/orders/order.route';
import { shippingRoutes } from './app/shipping/shipping.route';
import { webhookRoutes } from './app/webhook/midtrans.route';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi Database
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('FATAL ERROR: DATABASE_URL is not set in .env file!');
  process.exit(1);
}
mongoose.connect(dbUrl)
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Pendaftaran Rute
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/webhooks/midtrans', webhookRoutes);

// Server Listen
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`🚀 Backend server listening at http://localhost:${port}`);
});
server.on('error', console.error);
