import connectDB from '../../lib/mongodb';
import Order from '../../models/order';
import User from '../../models/user';
import Product from '../../models/product';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { 
      customerName, 
      email, 
      phone, 
      address,
      items,
      totalAmount
    } = req.body;

    // Validasi
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Keranjang belanja kosong' });
    }

    if (!customerName || !email || !phone) {
      return res.status(400).json({ message: 'Data customer tidak lengkap' });
    }

    // Generate external ID
    const externalId = `PHAMIE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Format items untuk order
    const orderItems = items.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    // Buat order
    const order = await Order.create({
      externalId,
      customerName,
      email,
      phone,
      address: address || '-',
      items: orderItems,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Kirim notifikasi WhatsApp checkout
    try {
      await sendCheckoutNotification(order);
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      // Tetap lanjut meskipun notifikasi gagal
    }

    return res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        externalId: order.externalId,
        totalAmount: order.totalAmount,
        status: order.status
      },
      message: 'Checkout berhasil'
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan pada server',
      error: error.message 
    });
  }
}

async function sendCheckoutNotification(order) {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  
  if (!FONNTE_TOKEN) {
    console.warn('FONNTE_TOKEN not configured');
    return;
  }

  const itemsList = order.items.map((item, index) => 
    `${index + 1}. ${item.name} x${item.quantity} - Rp${(item.price * item.quantity).toLocaleString('id-ID')}`
  ).join('\n');

  const message = `🛍️ *PESANAN BARU - PHAMIE*\n\n` +
    `Terima kasih ${order.customerName}! 🎉\n\n` +
    `*Nomor Order:* ${order.externalId}\n\n` +
    `*Detail Pesanan:*\n${itemsList}\n\n` +
    `*Total:* Rp${order.totalAmount.toLocaleString('id-ID')}\n\n` +
    `*Alamat Pengiriman:*\n${order.address}\n\n` +
    `Status: ⏳ Menunggu Pembayaran\n\n` +
    `Silakan lakukan pembayaran untuk memproses pesanan Anda.\n\n` +
    `Terima kasih telah berbelanja di PHAMIE! 💛`;

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: order.phone,
        message: message,
        countryCode: '62'
      })
    });

    const data = await response.json();
    console.log('Fonnte checkout notification sent:', data);
    return data;
  } catch (error) {
    console.error('Fonnte error:', error);
    throw error;
  }
}