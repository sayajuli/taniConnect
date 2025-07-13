import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
  password?: string;
  role: 'buyer' | 'farmer' | 'partner' | 'admin';
  addresses: {
    _id: Schema.Types.ObjectId;
    label: string;
    street: string;
    province: string;
    provinceId: string;
    city: string;
    cityId: string;
    district: string;
    postalCode?: string;
  }[];
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phoneNumber: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['buyer', 'farmer', 'partner', 'admin'], default: 'buyer' },
  addresses: [
    {
      label: { type: String, default: 'Alamat Utama' },
      street: { type: String, required: true },
      province: { type: String, required: true },
      provinceId: { type: String, required: true },
      city: { type: String, required: true },
      cityId: { type: String, required: true },
      district: { type: String, required: true },
      postalCode: { type: String },
    }
  ],
}, { timestamps: true });

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const UserModel: Model<IUser> = model<IUser>('User', userSchema);