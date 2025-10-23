import connectDB from '../../../lib/mongodb';
import Order from '../../../models/order';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Tidak terautentikasi' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user email from token
    const userEmail = decoded.email;

    // Find orders by email
    const orders = await Order.find({ email: userEmail })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan pada server',
      error: error.message 
    });
  }
}