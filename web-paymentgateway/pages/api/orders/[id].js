import connectDB from '../../../lib/mongodb';
import Order from '../../../models/order';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const order = await Order.findById(id).populate('items.productId');
      
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }

      res.status(200).json({ success: true, order });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data order' });
    }
  } 
  else if (req.method === 'PUT') {
    try {
      const { status, paymentProof } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (paymentProof) updateData.paymentProof = paymentProof;

      const order = await Order.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now() },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Order berhasil diupdate',
        order 
      });
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengupdate order' });
    }
  } 
  else if (req.method === 'DELETE') {
    try {
      const order = await Order.findByIdAndDelete(id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Order berhasil dihapus' 
      });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ success: false, message: 'Gagal menghapus order' });
    }
  } 
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}