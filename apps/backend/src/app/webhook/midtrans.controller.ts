// apps/backend/src/app/webhooks/midtrans.controller.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import { snap } from '../../config/midtrans';
import { OrderModel } from '../orders/order.model';

export const midtransNotificationHandler = async (req: Request, res: Response) => {
  try {
    // 1. Buat notifikasi dari body request menggunakan library Midtrans
    const notificationJson = req.body;
    const statusResponse = await snap.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Menerima notifikasi dari Midtrans untuk order ${orderId} dengan status: ${transactionStatus}`);

    // 2. Verifikasi Keamanan (Sangat Penting!)
    // Ini untuk memastikan notifikasi benar-benar datang dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
    const signatureKey = crypto.createHash('sha512').update(orderId + statusResponse.status_code + statusResponse.gross_amount + serverKey).digest('hex');
    if (signatureKey !== statusResponse.signature_key) {
      return res.status(403).send('Forbidden: Invalid signature');
    }

    // 3. Update Status Pesanan di Database
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (transactionStatus == 'capture') {
        if (fraudStatus == 'accept') {
            // Pembayaran berhasil dan aman
            order.status = 'paid';
        }
    } else if (transactionStatus == 'settlement') {
        // Pembayaran berhasil dan dana sudah masuk
        order.status = 'paid';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        // Pembayaran gagal atau dibatalkan
        order.status = 'failed';
    } else if (transactionStatus == 'pending') {
        // Pembayaran masih menunggu
        order.status = 'pending_payment';
    }

    // Simpan perubahan status ke database
    await order.save();

    // 4. Kirim respons 200 OK agar Midtrans tahu laporannya sudah diterima
    res.status(200).send('OK');

  } catch (error) {
    console.error("Midtrans Webhook Error:", error);
    res.status(500).send('Internal Server Error');
  }
};
