import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinary';

const bufferToDataURI = (buffer: Buffer, mimeType: string) => {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
};

export const uploadImage = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file yang di-upload.' });
  }

  try {
    const fileUri = bufferToDataURI(req.file.buffer, req.file.mimetype);
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'tani-connect-products',
    });

    return res.status(200).json({
      message: 'Upload berhasil',
      imageUrl: result.secure_url,
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ message: 'Gagal meng-upload gambar ke server.' });
  }
};