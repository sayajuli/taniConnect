// apps/web-frontend/app/(public)/products/[productId]/page.tsx

import Image from 'next/image';
import { getProductById } from '../../../services/api';
import AddToCartButton from '@/app/component/AddToCartButton';

// Definisikan tipe data untuk props halaman ini
interface PageProps {
  params: {
    productId: string;
  };
}

// Definisikan tipe data untuk produk
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  images?: string[];
  farmerId: {
    _id: string;
    name: string;
    username: string;
  };
}

// Ini adalah Server Component, kita bisa buat fungsinya async!
export default async function ProductDetailPage({ params }: PageProps) {
  // Gunakan 'use()' untuk "membuka" promise dan mendapatkan params
  const { productId } = params

  try {
    // Ambil data produk langsung di server saat halaman diminta
    const product: Product = await getProductById(productId);

    return (
      <div className="container p-8 mx-auto">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Kolom Gambar */}
          <div>
            <div className="relative w-full overflow-hidden bg-gray-200 rounded-lg aspect-square">
              <Image
                src={product.images?.[0] || '/images/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                priority // Prioritaskan gambar utama
              />
            </div>
            {/* Galeri gambar kecil bisa ditambahkan di sini nanti */}
          </div>

          {/* Kolom Detail & Aksi */}
          <div>
            <span className="px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full">
              {product.category}
            </span>
            <h1 className="mt-4 text-4xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-lg text-gray-500">
              dijual oleh <span className="font-semibold text-green-600">{product.farmerId.name}</span>
            </p>
            
            <p className="mt-6 text-4xl font-extrabold text-green-700">
              Rp {product.price.toLocaleString('id-ID')}
              <span className="text-xl font-normal text-gray-500"> / {product.unit}</span>
            </p>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">Deskripsi</h3>
              <p className="mt-2 text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>

            <div className="pt-8 mt-8 border-t">
              {/* Kita akan pindahkan logika keranjang ke komponennya sendiri */}
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Tampilan jika produk tidak ditemukan atau ada error
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Produk Tidak Ditemukan</h1>
        <p>Maaf, kami tidak dapat menemukan produk yang Anda cari.</p>
      </div>
    );
  }
}
