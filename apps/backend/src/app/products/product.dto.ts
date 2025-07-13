// apps/backend/src/app/products/product.dto.ts
import { z } from 'zod';

// Skema untuk validasi saat membuat produk baru
export const createProductSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.number().positive("Harga harus angka positif"),
  unit: z.enum(['kg', 'ikat', 'buah', 'kwintal']),
  stock: z.number().int().nonnegative("Stok harus angka bulat non-negatif"),
  category: z.enum(['Sayuran', 'Buah', 'Rempah', 'Umbi-umbian', 'Padi & Serealia'], {
    required_error: "Kategori wajib diisi",
  }),
  weight: z.number().int().positive("Berat harus angka positif dalam gram"),
  images: z.array(z.string()).optional(),
});

// Skema untuk validasi saat mengupdate produk
// .partial() adalah trik Zod untuk membuat semua field di dalam skema menjadi opsional.
export const updateProductSchema = createProductSchema.partial();
