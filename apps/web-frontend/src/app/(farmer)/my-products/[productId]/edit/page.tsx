// apps/web-frontend/app/(farmer)/products/[productId]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getProductById, updateProduct, deleteProduct } from '@/app/services/api';
import Image from 'next/image';

// Import komponen UI reusable kita
import Input from '@/app/component/Input';
import Button from '@/app/component/Button';
import Select from '@/app/component/Select';
import ImageUploader from '@/app/component/ImageUploader';

// Definisikan tipe data untuk form
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  weight: number;
}

export default function EditProductPage() {
  const { user, token, isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ambil data produk saat halaman dimuat
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const data = await getProductById(productId);
          setFormData({
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            unit: data.unit,
            category: data.category,
            weight: data.weight,
          });
          if (data.images) {
            setImageUrls(data.images);
          }
        } catch (err: any) {
          setError("Gagal memuat data produk.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev!,
      [name]: (name === 'price' || name === 'stock' || name === 'weight') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleUploadSuccess = (url: string) => {
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
    if (!formData || !token) {
      setError("Data tidak lengkap atau Anda tidak login.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const finalData = { ...formData, images: imageUrls };
      await updateProduct(productId, finalData, token);
      setSuccess("Produk berhasil diperbarui!");
      setTimeout(() => {
        router.push('/products');
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini? Aksi ini tidak bisa dibatalkan.')) {
      if (!token) {
        setError("Sesi Anda tidak valid.");
        return;
      }
      setIsDeleting(true);
      setError(null);
      try {
        await deleteProduct(productId, token);
        alert('Produk berhasil dihapus!');
        router.push('/products');
      } catch (err: any) {
        setError(err.message || "Gagal menghapus produk.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading || isAuthLoading) {
    return <div className="p-8 text-center">Memuat data produk...</div>;
  }
  
  if (!user || user.role !== 'farmer') {
    return <div className="p-8 text-center">Akses Ditolak.</div>;
  }

  if (error && !formData) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl p-4 mx-auto md:p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Edit Produk</h1>
      
      {formData ? (
        <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-white rounded-lg shadow-md">
          {/* Bagian Upload & Manajemen Gambar */}
          <div>
            <label className="block mb-2 text-lg font-semibold text-gray-700">Gambar Produk</label>
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-4">
                {imageUrls.map((url) => (
                  <div key={url} className="relative group">
                    <Image src={url} alt="Preview produk" width={100} height={100} className="object-cover border rounded-md" />
                    <button type="button" onClick={() => handleRemoveImage(url)} className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 -mt-2 -mr-2 text-white transition bg-red-500 rounded-full opacity-0 cursor-pointer group-hover:opacity-100">&times;</button>
                  </div>
                ))}
              </div>
            )}
            {imageUrls.length < 5 && <ImageUploader onUploadSuccess={handleUploadSuccess} />}
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
          
          <div className="text-center">
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t md:flex-row">
            <Button type="submit" isLoading={isSaving} className="w-full">
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button type="button" variant="secondary" isLoading={isDeleting} onClick={handleDelete} className="w-full text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500">
              {isDeleting ? 'Menghapus...' : 'Hapus Produk'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-8 text-center">Data produk tidak ditemukan.</div>
      )}
    </div>
  );
}
