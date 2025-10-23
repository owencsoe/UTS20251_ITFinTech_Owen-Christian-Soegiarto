import connectDB from '../../../lib/mongodb';
import Product from '../../../models/product';

export default async function handler(req, res) {
  await connectDB();

  // ✅ GET — ambil semua produk
  if (req.method === 'GET') {
    try {
      const products = await Product.find().sort({ createdAt: -1 }).lean();

      // Tambahkan fallback createdAt biar data lama tetap muncul
      const normalizedProducts = products.map(p => ({
        ...p,
        createdAt: p.createdAt || new Date(),
      }));

      res.status(200).json({ success: true, products: normalizedProducts });
    } catch (error) {
      console.error('❌ Get products error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data produk' });
    }
  }

  // ✅ POST — tambah produk baru
  else if (req.method === 'POST') {
    try {
      const { name, price, category, image, stock } = req.body;

      if (!name || !price || !category || !image) {
        return res.status(400).json({
          success: false,
          message: 'Nama, harga, kategori, dan gambar harus diisi',
        });
      }

      const product = await Product.create({
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        image: image.trim(),
        stock: Number(stock) || 0,
      });

      res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan',
        product,
      });
    } catch (error) {
      console.error('❌ Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan produk',
      });
    }
  }

  // ❌ Method lain
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
