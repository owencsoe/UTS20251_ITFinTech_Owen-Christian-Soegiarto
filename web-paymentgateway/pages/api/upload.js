import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

// Disable body parser biar bisa handle file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Setup formidable untuk parse multipart form
    const uploadDir = path.join(process.cwd(), 'public'); // ← HAPUS 'products'
    
    // Buat folder public kalau belum ada (harusnya udah ada)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // Max 5MB
      filename: (name, ext, part, form) => {
        // Buat unique filename: timestamp-originalname
        return `${Date.now()}-${part.originalFilename}`;
      }
    });

    // Parse request
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFile = files.image?.[0] || files.image;
    
    if (!uploadedFile) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Get filename untuk save ke database
    const filename = path.basename(uploadedFile.filepath);
    const imageUrl = `/${filename}`; // ← HAPUS '/products/'

    return res.status(200).json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
}