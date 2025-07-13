// apps/web-frontend/app/login/page.tsx
'use client'

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { loginUser } from "../../services/api";
import Image from "next/image";
import Link from "next/link";
import Input from "../../component/Input";
import Button from "../../component/Button";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Untuk ikon mata
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await loginUser({email, password});
      login(data.token, data.user);
      
      if (data.user.role === 'farmer') {
        router.push('/dashboard');
      } else {
        router.push('/products');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7FEF6]">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <Image
          src="/images/logo.png"
          alt="Logo TaniConnect"
          width={120}
          height={30}
          className="mx-auto"
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h1>
          <p className="text-gray-500">Silakan masuk ke akun Anda</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contoh@email.com"
            required
          />
          
          <div className="relative">
             <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pr-10"
             />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 mt-7 hover:text-gray-700"
             >
              <Image
                src={showPassword? "/images/eye.png" : "/images/hidden.png"}
                alt="Toggle visibility Password"
                width={20}
                height={20}
              />
             </button>
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-green-600 hover:underline">
              Lupa Password?
            </Link>
          </div>

          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <Button type="submit" isLoading={isLoading}>
            Login
          </Button>
        </form>
        
        <p className="text-sm text-center text-gray-600">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-green-600 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
