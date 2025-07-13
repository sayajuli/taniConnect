import { z } from 'zod';

export const addItemToCartSchema = z.object({
  productId: z.string().nonempty('Product ID is required'),
  quantity: z.number().int().positive('Kuantitas harus angka bulat').default(1),
});

export const updateItemQuantitySchema = z.object({
  quantity: z.number().int().min(1, 'Kuantitas minimal adalah 1')
});