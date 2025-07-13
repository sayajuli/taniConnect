// apps/backend/src/app/cart/cart.controller.ts
import { Request, Response } from 'express';
import { CartModel } from './cart.model';
import { addItemToCartSchema, updateItemQuantitySchema } from './cart.dto';
import mongoose from 'mongoose';

/**
 * Controller untuk menambah item ke keranjang.
 */
export const addItemToCart = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { productId, quantity } = addItemToCartSchema.parse(req.body);
    const userId = req.user.id;

    // Cari keranjang milik user
    let cart = await CartModel.findOne({ userId });

    // Jika keranjang tidak ada, buat yang baru
    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      // Jika keranjang ada, cari apakah produk sudah ada di dalamnya
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // Jika produk sudah ada, update kuantitasnya
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Jika produk belum ada, tambahkan sebagai item baru
        cart.items.push({ 
          productId: new mongoose.Types.ObjectId(productId) as any, 
          quantity 
        });
      }
      await cart.save();
    }
    
    // Populate untuk menampilkan detail produk di respons
    const populatedCart = await cart.populate({
      path: 'items.productId',
      select: 'name price images',
    });

    return res.status(200).json(populatedCart);

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ message: 'Data input tidak valid', errors: JSON.parse(error.message) });
    }
    console.error(error);
    return res.status(500).json({ message: 'Gagal menambahkan ke keranjang' });
  }
};

/**
 * Controller untuk mengambil isi keranjang pengguna.
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const userId = req.user.id;

    // Cari keranjang milik user dan populate detail produk serta petani
    const cart = await CartModel.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price images unit farmerId', // Ambil field yang kita butuhkan
      populate: {
        path: 'farmerId',
        select: 'name', // Ambil nama petani dari produk
      },
    });

    // Jika user belum punya keranjang sama sekali, kembalikan objek keranjang kosong
    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    return res.status(200).json(cart);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal mengambil data keranjang' });
  }
};

/**
 * Controller untuk menghapus satu item dari keranjang.
 */
export const removeItemFromCart = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await CartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId: new mongoose.Types.ObjectId(productId) } } },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price images unit farmerId',
      populate: { path: 'farmerId', select: 'name' },
    });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal menghapus item dari keranjang' });
  }
};

/**
 * Controller untuk mengubah kuantitas item di keranjang.
 */
export const updateItemQuantity = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = updateItemQuantitySchema.parse(req.body);

    // Jika kuantitas 0 atau kurang, hapus saja itemnya
    if (quantity <= 0) {
      return removeItemFromCart(req, res);
    }

    const cart = await CartModel.findOneAndUpdate(
      { userId, 'items.productId': new mongoose.Types.ObjectId(productId) },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price images unit farmerId',
      populate: { path: 'farmerId', select: 'name' },
    });

    if (!cart) {
      return res.status(404).json({ message: 'Item tidak ditemukan di keranjang' });
    }

    return res.status(200).json(cart);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ message: 'Data input tidak valid', errors: JSON.parse(error.message) });
    }
    console.error(error);
    return res.status(500).json({ message: 'Gagal mengupdate kuantitas' });
  }
};
