// apps/backend/src/app/products/product.controller.ts
import { Request, Response } from 'express';
import { createProductSchema, updateProductSchema } from './product.dto';
import { ProductModel } from './product.model';
import { IUser } from '../users/user.model'; // Import IUser untuk type-safety

/**
 * Controller untuk membuat produk baru.
 * Hanya bisa diakses oleh user dengan role 'farmer'.
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    // Pola Penjaga Gerbang: Pastikan user ada sebelum melanjutkan.
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const validatedData = createProductSchema.parse(req.body);

    const newProduct = await ProductModel.create({
      ...validatedData,
      farmerId: req.user.id, // Aman digunakan karena req.user sudah dipastikan ada.
    });

    return res.status(201).json(newProduct);

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ message: 'Data input tidak valid', errors: JSON.parse(error.message) });
    }
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

/**
 * Controller untuk mengambil semua produk (untuk marketplace publik).
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.find({})
      .populate('farmerId', 'name') // Ambil nama petani
      .sort({ createdAt: -1 }); // Urutkan dari yang terbaru

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data produk' });
  }
};

/**
 * Controller untuk mengambil produk milik petani yang sedang login.
 */
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    // Pola Penjaga Gerbang
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const products = await ProductModel.find({ farmerId: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal mengambil data produk Anda' });
  }
};

/**
 * Controller untuk mengambil detail satu produk berdasarkan ID.
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findById(req.params.id)
      .populate('farmerId', 'name username'); // Ambil detail petani

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak tersedia' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

/**
 * Controller untuk mengupdate produk.
 * Hanya bisa diakses oleh petani pemilik produk.
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Pola Penjaga Gerbang
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const validatedData = updateProductSchema.parse(req.body);
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // Pengecekan kepemilikan
    if (product.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak punya izin untuk mengedit produk ini' });
    }

    // Update field produk dengan data baru
    Object.assign(product, validatedData);

    const updatedProduct = await product.save();
    
    res.status(200).json(updatedProduct);
    
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ message: 'Data input tidak valid', errors: JSON.parse(error.message) });
    }
    console.error(error);
    return res.status(500).json({ message: 'Gagal mengupdate produk' });
  }
};

/**
 * Controller untuk menghapus produk.
 * Hanya bisa diakses oleh petani pemilik produk.
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    if (product.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak punya izin untuk menghapus produk ini' });
    }

    await product.deleteOne();

    return res.status(204).send();

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal menghapus produk' });
  }
};
