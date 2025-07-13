// apps/backend/src/app/orders/order.routes.ts
import { Router } from 'express';
import { createOrder } from './order.controller';
import { protect, restrictTo } from '../users/auth.middleware';

const router = Router();

/**
 * Rute untuk membuat pesanan baru.
 * - `protect`: Memastikan hanya user yang sudah login yang bisa mengakses.
 * - `restrictTo('buyer')`: Memastikan hanya user dengan role 'buyer' yang bisa membuat pesanan.
 * - `createOrder`: Controller yang akan dieksekusi jika semua middleware lolos.
 */
router.post('/', protect, restrictTo('buyer'), createOrder);

export const orderRoutes = router;
