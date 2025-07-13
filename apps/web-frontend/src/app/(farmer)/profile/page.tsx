'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { getMyProfile } from "@/app/services/api";

interface ProfileData {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
};

export default function ProfilePage() {
  const { token, user, logout, isAuthLoading } = useAuth();
  const router = useRouter();

  const [profilData, setProfilData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if(isAuthLoading) {
      return;
    }

    if (!user || !token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getMyProfile(token);
        setProfilData(data);
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat profil. Sesi anda mungkin telah berakhir");
        logout();
        router.push('/login');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchProfile();
  }, [user, token, isAuthLoading, router, logout]);

  if (isAuthLoading) {
    return <div className="p-8 text-center">Memuat sesi...</div>;
  }

  return (
    <div className="max-w-2xl p-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Profil Anda</h1>
        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="px-4 py-2 text-white transition bg-red-500 rounded hover:bg-red-600">
            Logout
          </button>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        {isLoadingData ? (
          <p>Memuat data profil..</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : profilData ? (          
        <div className="space-y-4">
          <p><strong>Nama:</strong> {profilData?.name || 'Memuat...'}</p>
          <p><strong>Username:</strong> {profilData?.username || 'Memuat...'}</p>
          <p><strong>Email:</strong> {profilData?.email || 'Memuat...'}</p>
          <p><strong>No. Hp:</strong> {profilData?.phoneNumber || 'Memuat...'}</p>
          <p><strong>Bergabung Sejak:</strong>
            {profilData? new Date(profilData.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : 'Memuat...'}
          </p>
        </div>
        ) : null}
      </div>
    </div>
  );
};