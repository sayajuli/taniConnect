// apps/backend/src/app/webhooks/midtrans.routes.ts
import { Router } from 'express';
import { midtransNotificationHandler } from './midtrans.controller';

const router = Router();

// Endpoint ini yang akan menerima laporan dari Midtrans
router.post('/notification', midtransNotificationHandler);

export const webhookRoutes = router;
