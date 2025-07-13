'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container p-8 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">
        Selamat Datang di Dashboard, {user?.name}!
      </h1>
      <p className="mb-8 text-gray-600">
        Ini adalah pusat kendali Anda. Dari sini Anda bisa mengelola produk dan melihat statistik penjualan.
      </p>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link href="/my-products" className="block p-6 transition-shadow bg-white border rounded-lg shadow-md hover:shadow-lg">
          <h2 className="text-xl font-semibold text-green-700">Produk Saya</h2>
          <p className="mt-2 text-gray-500">Lihat, tambah, edit, atau hapus produk yang Anda jual.</p>
        </Link>

        {/* Kartu lain bisa ditambahkan di sini nanti */}
        <div className="p-6 bg-white border rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Pesanan Masuk</h2>
          <p className="mt-2 text-gray-500">(Fitur akan datang) Lihat pesanan yang masuk dari pembeli.</p>
        </div>
      </div>
    </div>
  );
}
