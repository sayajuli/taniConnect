// apps/backend/src/app/orders/order.dto.ts
import { z } from 'zod';

// Skema untuk memvalidasi satu item di dalam pesanan
const orderItemSchema = z.object({
  productId: z.string().nonempty("ID produk tidak boleh kosong"),
  quantity: z.number().int().positive("Kuantitas harus angka positif"),
});

// Skema untuk memvalidasi informasi pengiriman yang dipilih oleh user
const shippingInfoSchema = z.object({
  address: z.string().nonempty("Alamat lengkap wajib diisi"),
  city: z.string().nonempty("Kota wajib diisi"),
  postalCode: z.string().optional(),
  courier: z.string().nonempty("Kurir wajib dipilih"),
  service: z.string().nonempty("Layanan pengiriman wajib dipilih"),
  cost: z.number().nonnegative("Biaya ongkir tidak valid"),
  etd: z.string().optional(),
});

// Skema utama untuk body request saat membuat pesanan baru
export const createOrderSchema = z.object({
  // 'items' harus berupa array yang berisi minimal satu item
  items: z.array(orderItemSchema).min(1, "Keranjang tidak boleh kosong"),
  // 'shippingInfo' harus berupa objek yang sesuai dengan skema di atas
  shippingInfo: shippingInfoSchema,
});
