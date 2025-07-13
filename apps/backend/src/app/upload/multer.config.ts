// apps/backend/src/app/upload/multer.config.ts
import multer from 'multer';
import path from 'path';

// Konfigurasi penyimpanan di memori (RAM), bukan di disk server.
// Ini lebih cepat dan efisien karena kita hanya akan meneruskan file ke Cloudinary,
// tidak perlu menyimpannya secara permanen di server kita.
const storage = multer.memoryStorage();

// Filter untuk memastikan hanya file dengan tipe gambar yang bisa di-upload.
// Ini adalah lapisan keamanan pertama untuk validasi file.
const fileFilter = (req: any, file: any, cb: any) => {
  // Tentukan tipe file yang diizinkan (jpeg, jpg, png, gif)
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  
  // Cek tipe MIME dari file (misal: 'image/jpeg')
  const isMimeTypeAllowed = allowedFileTypes.test(file.mimetype);
  
  // Cek ekstensi file (misal: '.jpg')
  const isExtensionAllowed = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

  if (isMimeTypeAllowed && isExtensionAllowed) {
    // Jika tipe dan ekstensi diizinkan, lanjutkan
    return cb(null, true);
  }
  // Jika tidak, tolak file dengan memberikan pesan error
  cb(new Error('Error: Hanya file gambar yang diizinkan! (jpeg, jpg, png, gif)'));
};

// Buat dan ekspor instance multer dengan konfigurasi kita
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 2 * 1024 * 1024 // Batasi ukuran file maksimal, contoh: 2 Megabytes
  } 
});
