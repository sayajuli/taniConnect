import { Router } from 'express';
import { getShippingRates } from './shipping.controller';
import { protect } from '../users/auth.middleware';

const router = Router();

// Endpoint ini harus diproteksi agar hanya user yang login yang bisa cek ongkir
router.post('/rates', protect, getShippingRates);

export const shippingRoutes = router;