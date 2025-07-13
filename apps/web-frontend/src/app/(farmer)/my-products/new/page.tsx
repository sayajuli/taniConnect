// apps/web-frontend/app/(farmer)/products/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { createProduct } from '../../../services/api'; 
import Image from 'next/image';

// Import komponen UI reusable kita
import ImageUploader from '@/app/component/ImageUploader';
import Input from '@/app/component/Input';
import Button from '@/app/component/Button';
import Select from '@/app/component/Select';

export default function AddProductPage() {
  const { user, token, isAuthLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    unit: 'kg',
    category: 'Sayuran',
    weight: 1000, // Default 1kg (1000 gram)
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]); 
  
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Proteksi rute
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'stock' || name === 'weight') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleUploadSuccess = (url: string) => {
    console.log('handleUploadSuccess dipanggil dengan URL:', url);
    if (imageUrls.length < 5) {
      setImageUrls(prev => [...prev, url]);
    } else {
      alert("Anda hanya bisa mengunggah maksimal 5 gambar.");
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Anda harus login untuk menambah produk.");
      return;
    }
    if (imageUrls.length === 0) {
      setError("Mohon unggah minimal satu gambar produk.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setValidationErrors([]);
    setSuccess(null);

    try {
      const finalData = {
        ...formData,
        images: imageUrls,
      };
      console.log("Data yang akan dikirim ke backend:", JSON.stringify(finalData, null, 2));
      await createProduct(finalData, token); 
      setSuccess("Produk berhasil ditambahkan! Anda akan diarahkan ke dashboard.");
      setTimeout(() => {
        router.push('/products'); // Arahkan ke halaman produk petani
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan produk.");
      if (err.details) {
        console.error("Validation Errors:", err.details);
        setValidationErrors(err.details);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || !user) {
    return <div className="p-8 text-center">Memuat sesi...</div>;
  }
  
  if (user.role !== 'farmer') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
        <p>Hanya petani yang bisa mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-4 mx-auto md:p-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Jual Produk Anda</h1>
      <p className="mb-8 text-gray-500">Isi detail produk yang ingin Anda jual di TaniConnect.</p>

      <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-white rounded-lg shadow-md">
        
        {/* Bagian Upload Gambar */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-gray-700">Gambar Produk</label>
          <p className="mb-4 text-sm text-gray-500">Unggah hingga 5 gambar. Gambar pertama akan menjadi foto utama.</p>
          <ImageUploader onUploadSuccess={handleUploadSuccess} />
          
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {imageUrls
                .filter(url => url)
                .map((url) => (
                <div key={url} className="relative group"> 
                  <Image src={url} alt={`Preview produk`} width={100} height={100} className="object-cover border rounded-md" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 -mt-2 -mr-2 text-white transition bg-red-500 rounded-full opacity-0 cursor-pointer group-hover:opacity-100"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr/>

        {/* Bagian Detail Produk */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-gray-700">Detail Produk</label>
          <div className="space-y-4">
            <Input label="Nama Produk" id="name" name="name" value={formData.name} onChange={handleChange} required />
            <div>
              <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required />
            </div>
          </div>
        </div>

        <hr/>

        {/* Bagian Harga & Stok */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-gray-700">Harga, Stok, & Kategori</label>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input label="Harga (Rp)" id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
            <Select label="Satuan" id="unit" name="unit" value={formData.unit} onChange={handleChange}>
              <option value="kg">Kg</option>
              <option value="ikat">Ikat</option>
              <option value="buah">Buah</option>
              <option value="kwintal">Kwintal</option>
            </Select>
            <Input label="Stok" id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
            <Input label="Berat (gram)" id="weight" name="weight" type="number" value={formData.weight} onChange={handleChange} required />
            <Select label="Kategori" id="category" name="category" value={formData.category} onChange={handleChange} wrapperClassName="md:col-span-2">
              <option value="Sayuran">Sayuran</option>
              <option value="Buah">Buah</option>
              <option value="Rempah">Rempah</option>
              <option value="Umbi-umbian">Umbi-umbian</option>
              <option value="Padi & Serealia">Padi & Serealia</option>
            </Select>
          </div>
        </div>
        
        {/* Pesan Error & Sukses */}
        <div className="text-center">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>

        {/* Tombol Aksi */}
        <div className="pt-4 border-t">
          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? 'Menyimpan Produk...' : 'Jual Produk Sekarang'}
          </Button>
        </div>
      </form>
    </div>
  );
}
