// apps/backend/src/app/users/user.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from './user.model';
import { registerUserSchema, loginUserSchema } from './user.dto';

/**
 * Controller untuk mendaftarkan user baru.
 */
export const registUser = async (req: Request, res: Response) => {
  try {
    // 1. Validasi data masuk dari body request
    const validatedData = registerUserSchema.parse(req.body);

    // 2. Cek apakah email atau username sudah ada di database
    const existingUser = await UserModel.findOne({ 
      $or: [{ email: validatedData.email }, { username: validatedData.username }] 
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email atau username sudah terdaftar' });
    }

    // 3. Buat user baru. Password akan otomatis di-hash oleh pre-save hook di model.
    const newUser = await UserModel.create({
      name: validatedData.name,
      username: validatedData.username,
      email: validatedData.email,
      phoneNumber: validatedData.phoneNumber,
      password: validatedData.password,
      role: validatedData.role,
      addresses: [{
        street: validatedData.address.street,
        city: validatedData.address.city,
        cityId: validatedData.address.cityId,
        district: validatedData.address.district,
        province: validatedData.address.province,
        provinceId: validatedData.address.provinceId,
        postalCode: validatedData.address.postalCode,
      }]
    });

    // 4. Buat respons yang aman (tanpa password)
    const userResponse = { 
      _id: newUser._id, 
      name: newUser.name, 
      username: newUser.username, 
      email: newUser.email 
    };
    
    return res.status(201).json({ message: 'User Berhasil Dibuat!', user: userResponse });

  } catch (error) {
    // Tangani error validasi dari Zod
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ message: 'Data input tidak valid', errors: JSON.parse(error.message) });
    }
    // Tangani error server lainnya
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

/**
 * Controller untuk login user.
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    // 1. Validasi email dan password
    const { email, password } = loginUserSchema.parse(req.body);

    // 2. Cari user berdasarkan email dan minta agar field password diikutsertakan
    const user = await UserModel.findOne({ email }).select('+password');

    // 3. Cek apakah user ada DAN password cocok
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email atau password salah!" });
    }

    // 4. Buat token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1d' }
    );

    // 5. Kirim respons sukses
    return res.status(200).json({
      message: 'Login berhasil',
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token: token
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ message: 'Data input tidak valid', errors: JSON.parse(error.message) });
    }
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

/**
 * Controller untuk mengambil data profil user yang sedang login.
 */
export const getMyProfile = async (req: Request, res: Response) => {
  // Middleware 'protect' sudah menempelkan data user ke req.user
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    // Ini seharusnya tidak pernah terjadi jika middleware berjalan benar
    res.status(404).json({ message: 'User not found' });
  }
};
