// apps/backend/src/app/products/product.model.ts
import { Schema, model, Document, Model } from 'mongoose';

// Definisikan tipe data untuk TypeScript
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  unit: 'kg' | 'ikat' | 'buah' | 'kwintal';
  stock: number;
  category: 'Sayuran' | 'Buah' | 'Rempah' | 'Umbi-umbian' | 'Padi & Serealia';
  weight: number; // Berat dalam gram
  farmerId: Schema.Types.ObjectId;
  images?: string[];
}

// Definisikan skema untuk Mongoose
const productSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  unit: { 
    type: String, 
    enum: ['kg', 'ikat', 'buah', 'kwintal'], 
    required: true 
  },
  stock: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['Sayuran', 'Buah', 'Rempah', 'Umbi-umbian', 'Padi & Serealia'] 
  },
  weight: { 
    type: Number, 
    required: true, 
    default: 500 // Default 500 gram jika tidak diisi
  },
  farmerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  images: [{ type: String }],
}, { 
  timestamps: true 
});

export const ProductModel: Model<IProduct> = model<IProduct>('Product', productSchema);
