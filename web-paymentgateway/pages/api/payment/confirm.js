import connectDB from '../../../lib/mongodb';
import Order from '../../../models/order';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { orderId, paymentProof } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID diperlukan' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    // Update payment status
    order.paymentStatus = 'paid';
    order.status = 'lunas';
    order.paymentProof = paymentProof || null;
    order.paidAt = new Date();
    order.updatedAt = new Date();
    await order.save();

    // Kirim notifikasi WhatsApp pembayaran berhasil
    try {
      await sendPaymentConfirmationNotification(order);
    } catch (error) {
      console.error('Error sending payment notification:', error);
      // Tetap lanjut meskipun notifikasi gagal
    }

    return res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        externalId: order.externalId,
        status: order.status,
        paidAt: order.paidAt
      },
      message: 'Pembayaran berhasil dikonfirmasi'
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan pada server',
      error: error.message 
    });
  }
}

async function sendPaymentConfirmationNotification(order) {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  
  if (!FONNTE_TOKEN) {
    console.warn('FONNTE_TOKEN not configured');
    return;
  }

  const itemsList = order.items.map((item, index) => 
    `${index + 1}. ${item.name} x${item.quantity}`
  ).join('\n');

  const message = `✅ *PEMBAYARAN BERHASIL - PHAMIE*\n\n` +
    `Halo ${order.customerName}! 🎉\n\n` +
    `Pembayaran Anda telah kami terima!\n\n` +
    `*Nomor Order:* ${order.externalId}\n` +
    `*Total:* Rp${order.totalAmount.toLocaleString('id-ID')}\n\n` +
    `*Produk:*\n${itemsList}\n\n` +
    `Status: ✅ Lunas\n\n` +
    `Pesanan Anda sedang kami siapkan dan akan segera dikirim.\n\n` +
    `Anda akan mendapatkan notifikasi saat pesanan dikirim.\n\n` +
    `Terima kasih telah berbelanja di PHAMIE! 💛\n\n` +
    `Butuh bantuan? Hubungi customer service kami.`;

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
    console.log('Fonnte payment notification sent:', data);
    return data;
  } catch (error) {
    console.error('Fonnte payment error:', error);
    throw error;
  }
}