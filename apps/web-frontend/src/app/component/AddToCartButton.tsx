// apps/web-frontend/app/components/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { addItemToCart } from '../services/api';
import { Product } from '../(public)/products/[productId]/page';

import Button from './Button';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { token, user, updateCartCount, fetchCartCount } = useAuth();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddToCart = async () => {
    // 1. Cek apakah user sudah login
    if (!token || !user) {
      alert("Anda harus login untuk menambahkan ke keranjang.");
      router.push('/login');
      return;
    }

    // 2. Cek apakah role-nya adalah pembeli
    if (user.role !== 'buyer') {
      alert("Hanya pembeli yang dapat menambahkan produk ke keranjang.");
      return;
    }

    setIsAdding(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 3. Panggil API untuk menambah item
      await addItemToCart(product._id, quantity, token);
      setSuccessMessage(`${quantity} ${product.name} berhasil ditambahkan!`);
      
      // 4. Update jumlah item di keranjang (di Navbar)
      fetchCartCount();

      // Hilangkan pesan sukses setelah 3 detik
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      setError(err.message || "Gagal menambahkan ke keranjang.");
    } finally {
      setIsAdding(false);
    }
  };

  // Jangan tampilkan tombol sama sekali jika yang melihat adalah petani atau admin
  if (!user || user.role !== 'buyer') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="font-semibold">Kuantitas:</label>
        <div className="flex items-center border rounded-md">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))} 
            className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            disabled={quantity <= 1}
          >
            -
          </button>
          <input 
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-16 h-full text-center border-l border-r focus:outline-none"
            min="1"
          />
          <button 
            onClick={() => setQuantity(q => q + 1)} 
            className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>
      
      <Button onClick={handleAddToCart} isLoading={isAdding}>
        + Tambah ke Keranjang
      </Button>

      {successMessage && <p className="mt-2 text-green-600">{successMessage}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}