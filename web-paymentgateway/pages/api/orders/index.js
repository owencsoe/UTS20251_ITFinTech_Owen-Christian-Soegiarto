import connectDB from '../../../lib/mongodb';
import Order from '../../../models/order';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('items.productId');
      
      res.status(200).json({ success: true, orders });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data orders' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      const { customerName, email, phone, address, items, totalAmount } = req.body;

      // Validasi input
      if (!customerName || !email || !phone || !address || !items || !totalAmount) {
        return res.status(400).json({ 
          success: false, 
          message: 'Semua field harus diisi' 
        });
      }

      const order = await Order.create({
        customerName,
        email,
        phone,
        address,
        items,
        totalAmount,
        status: 'waiting payment',
      });

      res.status(201).json({ 
        success: true, 
        message: 'Order berhasil dibuat',
        order 
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Gagal membuat order' 
      });
    }
  } 
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}