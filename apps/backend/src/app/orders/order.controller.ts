// apps/backend/src/app/orders/order.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createOrderSchema } from './order.dto';
import { CartModel } from '../cart/cart.model';
import { ProductModel } from '../products/product.model';
import { OrderModel } from './order.model';
import { snap } from '../../config/midtrans'; // Konfigurasi Midtrans kita

/**
 * Controller untuk membuat pesanan baru dan sesi pembayaran.
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    // 1. Validasi data yang dikirim dari frontend menggunakan Zod
    const { items, shippingInfo } = createOrderSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const buyer = req.user;

    // 2. Ambil data produk asli dari database untuk keamanan harga
    const productIds = items.map(item => item.productId);
    const productsInDb = await ProductModel.find({ _id: { $in: productIds } });

    // Pastikan semua produk yang dipesan ada di database
    if (productsInDb.length !== items.length) {
      return res.status(400).json({ message: 'Beberapa produk di keranjang Anda tidak ditemukan.' });
    }

    // 3. Hitung subtotal berdasarkan harga dari database (bukan dari frontend)
    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = productsInDb.find(p => p.id === item.productId);
      if (!product) {
        // Seharusnya tidak pernah terjadi karena pengecekan di atas
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
      }
      subtotal += product.price * item.quantity;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
      };
    });

    // 4. Tentukan biaya aplikasi dan hitung total akhir
    const appFee = 2000; // Contoh biaya aplikasi Rp 2.000
    const totalAmount = subtotal + shippingInfo.cost + appFee;

    // 5. Buat ID Pesanan yang unik dan mudah dibaca
    const orderId = `TNC-${Date.now()}-${buyer.id.slice(-4)}`;

    // 6. Siapkan parameter untuk dikirim ke Midtrans
    const midtransParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      item_details: [
        ...orderItems.map(item => ({
          id: item.productId,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
        })),
        { id: 'SHIPPING_COST', price: shippingInfo.cost, quantity: 1, name: 'Biaya Pengiriman' },
        { id: 'APP_FEE', price: appFee, quantity: 1, name: 'Biaya Aplikasi' },
      ],
      customer_details: {
        first_name: buyer.name,
        email: buyer.email,
        phone: buyer.phoneNumber,
      },
    };

    // 7. Buat transaksi di Midtrans untuk mendapatkan token pembayaran
    const transaction = await snap.createTransaction(midtransParams);
    const paymentToken = transaction.token;

    // 8. Simpan pesanan baru ke database kita dengan status 'pending_payment'
    const newOrder = await OrderModel.create({
      _id: orderId, // Gunakan ID custom kita
      buyerId: buyer.id,
      items: orderItems,
      amount: {
        subtotal,
        shipping: shippingInfo.cost,
        appFee,
        total: totalAmount,
      },
      shippingInfo,
      status: 'pending_payment',
      paymentInfo: {
        paymentToken: paymentToken,
      },
    });

    // 9. Kosongkan keranjang belanja pengguna setelah pesanan berhasil dibuat
    await CartModel.findOneAndDelete({ userId: buyer.id });

    // 10. Kirim kembali token pembayaran ke frontend agar bisa menampilkan pop-up pembayaran
    res.status(201).json({
      message: 'Pesanan berhasil dibuat, silakan lanjutkan pembayaran.',
      order: newOrder,
      paymentToken: paymentToken,
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ message: 'Data input tidak valid', errors: JSON.parse(error.message) });
    }
    console.error("Create Order Error:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat membuat pesanan' });
  }
};
