// apps/backend/src/app/products/product.routes.ts
import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from './product.controller';
import { protect, restrictTo } from '../users/auth.middleware';

const router = Router();

// --- Rute untuk endpoint /api/products ---
router.route('/')
  .post(protect, restrictTo('farmer'), createProduct) // POST /api/products -> Buat produk baru (hanya farmer)
  .get(getAllProducts);                             // GET /api/products -> Lihat semua produk (publik)

// --- Rute khusus untuk /api/products/my-products ---
router.route('/my-products')
  .get(protect, restrictTo('farmer'), getMyProducts); // GET /api/products/my-products -> Lihat produk milik sendiri

// --- Rute untuk satu produk spesifik berdasarkan ID, misal: /api/products/12345 ---
router.route('/:id')
  .get(getProductById)                               // GET /api/products/:id -> Lihat detail produk (publik)
  .put(protect, restrictTo('farmer'), updateProduct)   // PUT /api/products/:id -> Update produk (hanya farmer pemilik)
  .delete(protect, restrictTo('farmer'), deleteProduct); // DELETE /api/products/:id -> Hapus produk (hanya farmer pemilik)

export const productRoutes = router;
