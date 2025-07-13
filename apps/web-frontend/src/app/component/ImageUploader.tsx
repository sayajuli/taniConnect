// apps/web-frontend/app/components/ImageUploader.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../services/api';
import Button from './Button';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void; // Fungsi untuk mengirim URL kembali ke parent
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('File yang dipilih harus berupa gambar.');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) {
      setError('Pilih file terlebih dahulu atau pastikan Anda sudah login.');
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadImage(file, token);

      // === CCTV BARU DI SINI ===
      // Kita lihat seluruh isi respons dari API
      console.log('Respons lengkap dari API upload:', response);
      // =========================
      
      // Kirim URL ke parent
      onUploadSuccess(response.imageUrl); 
      alert('Gambar berhasil di-upload!');
      
      // Reset setelah berhasil
      setFile(null);
      setPreview(null);

    } catch (err: any) {
      setError(err.message || 'Gagal meng-upload gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed rounded-lg">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      {preview ? (
        <div className="text-center">
          <Image src={preview} alt="Preview" width={200} height={200} className="object-cover mx-auto mb-4 rounded-md" />
          <Button onClick={handleUpload} isLoading={isUploading} variant="secondary">
            {isUploading ? 'Mengunggah...' : 'Upload Gambar Ini'}
          </Button>
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center h-32 text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <p>Klik atau jatuhkan gambar di sini</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 2MB</p>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
