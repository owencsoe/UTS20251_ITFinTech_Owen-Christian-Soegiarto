import connectDB from '../../../lib/mongodb';
import Product from '../../../models/product';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  // ✅ GET — ambil 1 produk
  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }
      return res.status(200).json({ success: true, product });
    } catch (error) {
      console.error('❌ Get product error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data produk' });
    }
  }

  // ✅ PUT — update produk
  else if (req.method === 'PUT') {
    try {
      const { name, price, category, image, stock } = req.body || {};

      const updateData = {};
      if (name?.trim()) updateData.name = name.trim();
      if (price !== undefined && price !== '' && !isNaN(price)) updateData.price = Number(price);
      if (category?.trim()) updateData.category = category.trim();
      if (image?.trim()) updateData.image = image.trim();
      if (stock !== undefined && stock !== '' && !isNaN(stock)) updateData.stock = Number(stock);
      updateData.updatedAt = Date.now();

      const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      return res.status(200).json({
        success: true,
        message: 'Produk berhasil diupdate',
        product,
      });
    } catch (error) {
      console.error('❌ Update product error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengupdate produk' });
    }
  }

  // ✅ DELETE — hapus produk
  else if (req.method === 'DELETE') {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      return res.status(200).json({
        success: true,
        message: 'Produk berhasil dihapus',
      });
    } catch (error) {
      console.error('❌ Delete product error:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghapus produk' });
    }
  }

  // ❌ Method lain
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
