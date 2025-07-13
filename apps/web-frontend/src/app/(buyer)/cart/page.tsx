// apps/web-frontend/app/(buyer)/cart/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- 1. Import useRouter
import { useAuth } from '../../context/AuthContext';
import { getCart, removeItemFromCart, updateItemQuantity } from '../../services/api';
import Button from '@/app/component/Button';

// Definisikan tipe data untuk item di keranjang
interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    farmerId: {
      name: string;
    };
  };
  quantity: number;
}

// Definisikan tipe untuk respons dari API
interface CartResponse {
  items: CartItem[];
}

export default function CartPage() {
  const { token, updateCartCount, isAuthLoading } = useAuth();
  const router = useRouter(); // <-- 2. Inisialisasi router
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data: CartResponse = await getCart(token);
      setCart(data);
      updateCartCount(data.items?.length || 0);
    } catch (err: any) {
      setError(err.message || "Gagal memuat keranjang.");
    } finally {
      setIsLoading(false);
    }
  }, [token, updateCartCount]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchCart();
    }
  }, [token, isAuthLoading, fetchCart]);

  const handleRemoveItem = async (productId: string) => {
    if (!token || updatingItemId) return;
    setUpdatingItemId(productId);
    try {
      const updatedCart: CartResponse = await removeItemFromCart(productId, token);
      setCart(updatedCart);
      updateCartCount(updatedCart.items?.length || 0);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (!token || updatingItemId) return;
    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }
    setUpdatingItemId(productId);
    try {
      const updatedCart: CartResponse = await updateItemQuantity(productId, newQuantity, token);
      setCart(updatedCart);
      updateCartCount(updatedCart.items?.length || 0);
    } catch (err: any) {
      setError(err.message || "Gagal mengubah kuantitas.");
    } finally {
      setUpdatingItemId(null);
    }
  };
  
  const subtotal = cart?.items.reduce((acc, item) => acc + item.productId.price * item.quantity, 0) || 0;

  if (isLoading || isAuthLoading) return <div className="p-8 text-center">Memuat keranjang Anda...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container p-4 mx-auto md:p-8">
      <h1 className="mb-8 text-3xl font-bold">Keranjang Belanja Anda</h1>
      {!cart || cart.items.length === 0 ? (
        <div className="text-center">
          <p>Keranjang Anda masih kosong.</p>
          <Link href="/products" className="inline-block mt-4 text-green-600 hover:underline">
            Mulai Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map(({ productId, quantity }) => (
              <div key={productId._id} className={`flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm transition-opacity ${updatingItemId === productId._id ? 'opacity-50' : ''}`}>
                <Image
                  src={productId.images?.[0] || '/images/placeholder.png'}
                  alt={productId.name}
                  width={100}
                  height={100}
                  className="object-cover rounded-md"
                />
                <div className="flex-grow">
                  <h2 className="font-semibold">{productId.name}</h2>
                  <p className="text-sm text-gray-500">oleh {productId.farmerId.name}</p>
                  <p className="mt-1 font-bold text-green-600">Rp {productId.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => handleQuantityChange(productId._id, quantity - 1)} disabled={!!updatingItemId} className="px-3 py-1 text-lg font-bold text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed">-</button>
                    <span className="px-4 py-1">{quantity}</span>
                    <button onClick={() => handleQuantityChange(productId._id, quantity + 1)} disabled={!!updatingItemId} className="px-3 py-1 text-lg font-bold text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed">+</button>
                  </div>
                  <button onClick={() => handleRemoveItem(productId._id)} disabled={!!updatingItemId} className="p-2 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-500 disabled:cursor-not-allowed">
                    {updatingItemId === productId._id ? (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-gray-600 animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.716c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold">Ringkasan Pesanan</h2>
                <div className="flex justify-between mt-4">
                  <p>Subtotal</p>
                  <p>Rp {subtotal.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex justify-between mt-2 text-gray-500">
                  <p>Biaya Pengiriman</p>
                  <p>Rp -</p>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>Rp {subtotal.toLocaleString('id-ID')}</p>
                </div>
                {/* === BAGIAN YANG DIPERBAIKI === */}
                <Button 
                  className="w-full mt-6"
                  onClick={() => router.push('/checkout')} // <-- 3. Ubah onClick
                >
                  Lanjut ke Checkout
                </Button>
                {/* ============================ */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
