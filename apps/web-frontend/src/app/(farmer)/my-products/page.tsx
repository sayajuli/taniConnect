'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getMyFarmerProducts } from '../../services/api';
import Button from '@/app/component/Button';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  images?: string[];
}

export default function MyProductsPage() {
  const { user, token, isAuthLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const fetchProducts = async () => {
        try {
          const data = await getMyFarmerProducts(token);
          setProducts(data);
        } catch (err: any) {
          setError(err.message || "Gagal memuat produk Anda.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    }
  }, [token]);

  if (isAuthLoading || isLoading) return <div className="p-8 text-center">Memuat produk Anda...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container p-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Produk Saya</h1>
        <Link href="/my-products/new" className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">
          + Tambah Produk Baru
        </Link>
      </div>

      {products.length === 0 ? (
        <p>Anda belum memiliki produk. Silakan tambahkan produk baru.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product._id} className="overflow-hidden bg-white border rounded-lg shadow-md">
              <div className="relative w-full overflow-hidden aspect-square">
                <Image
                  src={product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">{product.category}</span>
                <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
                <p className="mt-1 text-gray-700">Stok: {product.stock} {product.unit}</p>
                <p className="mt-2 text-xl font-bold text-green-600">
                  Rp {product.price.toLocaleString('id-ID')} / {product.unit}
                </p>
                <Button 
                  variant='secondary' 
                  className="w-full mt-4"
                  onClick={() => router.push(`/my-products/${product._id}/edit`)}>
                  Edit Produk
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
