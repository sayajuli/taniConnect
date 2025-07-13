// apps/backend/src/app/cart/cart.routes.ts
import { Router } from 'express';
import {
  addItemToCart,
  getCart,
  removeItemFromCart,
  updateItemQuantity,
} from './cart.controller';
import { protect, restrictTo } from '../users/auth.middleware';

const router = Router();

// --- Rute untuk /api/cart ---
router.route('/')
  .get(protect, getCart)                                  // GET /api/cart -> Lihat isi keranjang (harus login)
  .post(protect, restrictTo('buyer'), addItemToCart);     // POST /api/cart -> Tambah item ke keranjang (hanya buyer)

// --- Rute untuk satu item spesifik di keranjang ---
router.route('/item/:productId')
  .put(protect, restrictTo('buyer'), updateItemQuantity) // PUT /api/cart/item/:id -> Update kuantitas (hanya buyer)
  .delete(protect, removeItemFromCart);                  // DELETE /api/cart/item/:id -> Hapus item (harus login)

export const cartRoutes = router;
