// apps/web-frontend/app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { registerUser } from '../../services/api';

// Import komponen UI reusable kita
import Input from '@/app/component/Input';
import Button from '@/app/component/Button';
import Select from '@/app/component/Select';
// Definisikan tipe data untuk wilayah dari API
interface Region {
  id: string;
  name: string;
}

// Ambil kunci API dan URL dari environment variables
const BINDERBYTE_API_KEY = process.env.NEXT_PUBLIC_BINDERBYTE_API_KEY;
const BINDERBYTE_BASE_URL = process.env.NEXT_PUBLIC_BINDERBYTE_BASE_URL;

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'buyer',
    address: {
      province: '',
      provinceId: '',
      city: '',
      cityId: '',
      district: '',
      street: '',
      postalCode: '',
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Ambil data provinsi saat komponen dimuat
  useEffect(() => {
    if (!BINDERBYTE_API_KEY) {
      console.error("API Key BinderByte tidak ditemukan. Pastikan ada di .env.local");
      setError("Konfigurasi API wilayah tidak ditemukan.");
      return;
    }
    fetch(`${BINDERBYTE_BASE_URL}/provinsi?api_key=${BINDERBYTE_API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.value)) {
          setProvinces(data.value);
        } else {
          console.error("Data provinsi tidak valid:", data);
        }
      })
      .catch((err) => console.error("Gagal mengambil provinsi:", err));
  }, []);

  // Ambil data kota/kabupaten setiap kali provinsi berubah
  useEffect(() => {
    if (selectedProvince && BINDERBYTE_API_KEY) {
      fetch(`${BINDERBYTE_BASE_URL}/kabupaten?api_key=${BINDERBYTE_API_KEY}&id_provinsi=${selectedProvince}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.value)) {
            setCities(data.value);
          }
        })
        .catch((err) => console.error("Gagal mengambil kota:", err));
    }
  }, [selectedProvince]);

  // Ambil data kecamatan setiap kali kota/kabupaten berubah
  useEffect(() => {
    if (selectedCity && BINDERBYTE_API_KEY) {
      fetch(`${BINDERBYTE_BASE_URL}/kecamatan?api_key=${BINDERBYTE_API_KEY}&id_kabupaten=${selectedCity}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.value)) {
            setDistricts(data.value);
          }
        })
        .catch((err) => console.error("Gagal mengambil kecamatan:", err));
    }
  }, [selectedCity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [e.target.name]: e.target.value },
    }));
  };
  
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const provinceName = e.target.options[e.target.selectedIndex].text;
    setSelectedProvince(provinceId);
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, province: provinceName, provinceId: provinceId, city: '', cityId: '', district: '' }
    }));
    setCities([]);
    setDistricts([]);
    setSelectedCity('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    const cityName = e.target.options[e.target.selectedIndex].text;
    setSelectedCity(cityId);
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, city: cityName, cityId: cityId, district: '' }
    }));
    setDistricts([]);
  };
  
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.options[e.target.selectedIndex].text;
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, district: districtName }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await registerUser(formData);
      setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat registrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7FEF6] py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <Image src="/images/logo.png" alt="Logo TaniConnect" width={120} height={30} className="mx-auto" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-gray-500">Gabung dengan TaniConnect sekarang!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Lengkap" id="name" name="name" onChange={handleChange} required />
          <Input label="Username" id="username" name="username" onChange={handleChange} required />
          <Input label="Email" id="email" name="email" type="email" onChange={handleChange} required />
          <Input label="Nomor Telepon" id="phoneNumber" name="phoneNumber" type="tel" onChange={handleChange} required />
          <Input label="Password" id="password" name="password" type="password" onChange={handleChange} required />
          
          <hr className="my-4" />
          <h3 className="text-lg font-semibold text-gray-800">Alamat Anda</h3>
          
          <Select label="Provinsi" name="province" onChange={handleProvinceChange} value={selectedProvince}>
            <option value="">Pilih Provinsi</option>
            {provinces.map((province) => (<option key={province.id} value={province.id}>{province.name}</option>))}
          </Select>
          <Select label="Kabupaten/Kota" name="city" onChange={handleCityChange} value={selectedCity} disabled={!selectedProvince}>
            <option value="">Pilih Kabupaten/Kota</option>
            {cities.map((city) => (<option key={city.id} value={city.id}>{city.name}</option>))}
          </Select>
          <Select label="Kecamatan" name="district" onChange={handleDistrictChange} disabled={!selectedCity}>
            <option value="">Pilih Kecamatan</option>
            {districts.map((district) => (<option key={district.id} value={district.id}>{district.name}</option>))}
          </Select>
          <Input label="Nama Jalan & No. Rumah" id="street" name="street" onChange={handleAddressChange} required />
          <Input label="Kode Pos" id="postalCode" name="postalCode" onChange={handleAddressChange} />

          <hr className="my-4" />
          <Select label="Saya ingin" name="role" onChange={handleChange} value={formData.role}>
            <option value="buyer">Membeli</option>
            <option value="farmer">Menjual (Petani)</option>
          </Select>

          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          {success && <p className="text-sm text-center text-green-500">{success}</p>}

          <Button type="submit" isLoading={isLoading}>
            {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-green-600 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
