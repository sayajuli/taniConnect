// apps/backend/src/app/cart/cart.model.ts
import { Schema, model, Document, Model } from 'mongoose';

// Definisikan bentuk satu item di dalam keranjang
interface ICartItem {
  productId: Schema.Types.ObjectId;
  quantity: number;
}

// Definisikan Interface untuk dokumen Cart
export interface ICart extends Document {
  userId: Schema.Types.ObjectId; // User pemilik keranjang
  items: ICartItem[]; // Daftar produk di dalam keranjang
}

// Buat Skema Mongoose
const cartSchema = new Schema<ICart>(
  {
    // Setiap keranjang dimiliki oleh satu user.
    // 'ref' menunjuk ke model 'User'.
    // 'unique: true' memastikan satu user hanya bisa punya satu dokumen keranjang.
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // 'items' adalah sebuah array yang berisi objek-objek produk.
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product', // 'ref' menunjuk ke model 'Product'.
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1, // Kuantitas minimal adalah 1
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true, // Otomatis tambahkan createdAt dan updatedAt
  }
);

// Buat dan ekspor Model
// Mongoose akan membuat koleksi bernama 'carts'
export const CartModel: Model<ICart> = model<ICart>('Cart', cartSchema);
