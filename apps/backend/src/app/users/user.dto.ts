// apps/backend/src/app/users/user.dto.ts
import { z } from 'zod';

export const registerUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").trim(),
  name: z.string().min(1, "Nama tidak boleh kosong").trim(),
  email: z.string().email("Format email tidak valid").trim().toLowerCase(),
  phoneNumber: z.string().min(10, "Nomor telepon tidak valid").trim(),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(['buyer', 'farmer', 'partner', 'admin']),
  address: z.object({
    street: z.string().min(1, "Jalan tidak boleh kosong"),
    province: z.string(),
    provinceId: z.string(),
    city: z.string(),
    cityId: z.string(),
    district: z.string(),
    postalCode: z.string().optional(),
  }),
});

export const loginUserSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});
