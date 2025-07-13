import { Router } from 'express';
import { uploadImage } from './upload.controller';
import { upload } from './multer.config';
import { protect } from '../users/auth.middleware';

const router = Router();

router.post('/', protect, upload.single('image'), uploadImage);

export const uploadRoutes = router;