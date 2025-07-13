// apps/backend/src/app/users/user.routes.ts
import { Router } from 'express';
import { registUser, loginUser, getMyProfile } from './user.controller';
import { protect } from './auth.middleware';

const router = Router();

// Rute untuk registrasi (publik)
router.post('/register', registUser);

// Rute untuk login (publik)
router.post('/login', loginUser);

// Rute untuk mengambil profil sendiri (terproteksi, harus login)
router.get('/profile', protect, getMyProfile);

export const userRoutes = router;
