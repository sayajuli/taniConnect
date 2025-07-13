'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '../../services/api';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  unit: string;
  images: string[];
  farmerId: {
    _id: string;
    name: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat produk.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) return <div className="p-8 text-center">Memuat produk...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container p-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Jelajahi Hasil Tani Terbaik</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link href={`/products/${product._id}`} key={product._id} className='black group'>          
            <div key={product._id} className="overflow-hidden bg-white border rounded-lg shadow-md">
              <div className="h-48 bg-gray-200">
                <div className="relative w-full overflow-hidden aspect-square">
                <Image
                  // 2. Tampilkan gambar pertama dari array, atau gambar placeholder jika tidak ada
                  src={product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500">oleh {product.farmerId.name}</p>
                <p className="mt-2 text-xl font-bold text-green-600">
                  Rp {product.price.toLocaleString('id-ID')} / {product.unit}
                </p>
                <button className="w-full px-4 py-2 mt-4 text-white bg-green-600 rounded-md hover:bg-green-700">
                  + Keranjang
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}