// apps/backend/src/app/orders/order.model.ts
import { Schema, model, Document, Model } from 'mongoose';

// Definisikan bentuk satu item di dalam pesanan.
// Kita salin data produk di sini agar riwayat pesanan tidak berubah jika produk aslinya diedit.
interface IOrderItem {
  productId: Schema.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

// Definisikan bentuk data pengiriman.
interface IShippingInfo {
  address: string; // Alamat lengkap dalam satu string
  city: string;
  postalCode?: string;
  courier: string; // misal: 'jne', 'tiki'
  service: string; // misal: 'REG', 'OKE'
  cost: number;
  etd?: string; // Estimasi waktu sampai
}

// Definisikan Interface untuk dokumen Order.
export interface IOrder extends Document {
  _id: string; // Kita akan gunakan ID custom, bukan ObjectId default
  buyerId: Schema.Types.ObjectId;
  items: IOrderItem[];
  amount: {
    subtotal: number;
    shipping: number;
    appFee: number;
    total: number;
  };
  shippingInfo: IShippingInfo;
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  paymentInfo: {
    midtransTransactionId?: string;
    paymentType?: string;
    paymentToken?: string; // Token Snap dari Midtrans
  };
}

// Buat Skema Mongoose.
const orderSchema = new Schema<IOrder>(
  {
    _id: { type: String, required: true },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    amount: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, required: true },
      appFee: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    shippingInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      courier: { type: String, required: true },
      service: { type: String, required: true },
      cost: { type: Number, required: true },
      etd: { type: String },
    },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'],
      default: 'pending_payment',
    },
    paymentInfo: {
      midtransTransactionId: { type: String },
      paymentType: { type: String },
      paymentToken: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Buat dan ekspor Model.
export const OrderModel: Model<IOrder> = model<IOrder>('Order', orderSchema);
