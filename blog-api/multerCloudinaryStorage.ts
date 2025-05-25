import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const storage = new CloudinaryStorage({
  cloudinary,
  params: (req) => ({
    folder: 'blog-posts',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  }),
});
