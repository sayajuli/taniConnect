'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const { user, logout, isAuthLoading, cartItemCount } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  return (
    <nav className="sticky top-0 z-50 p-4 bg-white shadow-md">
      <div className="flex items-center justify-between mx-auto ">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="TaniConnect Logo" width={150} height={40} priority />
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthLoading ? (
            <span>...</span>
          ) : user ? (
            <>
              {user.role === 'farmer' && (
                <Link href="/products/new" className="px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
                  + Tambah Produk
                </Link>
              )}
              <Link href="/profile" className="hover:text-green-600">Hi, {user.name}</Link>
              <button onClick={handleLogout} className="hover:text-green-600">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-green-600">Login</Link>
              <Link href="/register" className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600">Daftar</Link>
            </>
          )}

          {/* === IKON KERANJANG BARU === */}
          {user && user.role === 'buyer' && (
            <Link href="/cart" className="relative p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 hover:text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.344 1.087-.849l1.858-6.443a.75.75 0 0 0-.7-1.03H5.618M4.5 19.5h15a2.25 2.25 0 0 0 2.121-3.342l-2.28-7.98a2.25 2.25 0 0 0-2.121-1.658H5.25a2.25 2.25 0 0 0-2.121 1.658l-2.28 7.98A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}
          {/* ========================= */}
        </div>
      </div>
    </nav>
  );
}