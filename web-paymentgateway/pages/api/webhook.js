import connectDB from '@/lib/mongodb';
import Order from '@/models/order';

// 🧩 Fungsi kirim WhatsApp via Fonnte
async function sendWhatsAppNotification(order) {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

  if (!FONNTE_TOKEN) {
    console.warn("⚠️ FONNTE_TOKEN not configured");
    return;
  }

  const itemsList = order.items
    ?.map((item, i) => `${i + 1}. ${item.name} x${item.quantity}`)
    .join('\n') || '-';

  const message =
    `✅ *PEMBAYARAN BERHASIL - PHAMIE*\n\n` +
    `Halo *${order.customerName}*! 🎉\n\n` +
    `Pembayaran Anda telah kami terima.\n\n` +
    `*Nomor Order:* ${order.externalId}\n` +
    `*Total:* Rp${order.totalAmount.toLocaleString('id-ID')}\n\n` +
    `🛍️ *Rincian Pesanan:*\n${itemsList}\n\n` +
    `Status: ✅ *Lunas*\n\n` +
    `Pesanan Anda sedang kami proses dan akan segera dikirim 💛\n\n` +
    `Terima kasih telah berbelanja di *PHAMIE!* 💛\n\n`;

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: order.phone,
        message: message,
        countryCode: '62',
      }),
    });

    const data = await response.json();
    console.log('✅ WhatsApp payment confirmation sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp notification:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('🔔 Webhook received:', req.body);
  console.log('📋 Headers:', req.headers);

  try {
    const callbackToken = req.headers['x-callback-token'];

    // ✅ Verifikasi token webhook Xendit
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      console.log('❌ Invalid webhook token');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();

    const { id, external_id, status, paid_amount, paid_at } = req.body;

    console.log('📦 Processing order:', { external_id, status });

    // 🔎 Cari order di database
    const order = await Order.findOne({ externalId: external_id });

    if (!order) {
      console.log('⚠️ Order not found:', external_id);
      return res.status(200).json({
        success: false,
        message: 'Order not found',
      });
    }

    let updated = false;

    // 🔁 Update status order berdasarkan status dari Xendit
    if (status === 'PAID') {
      order.status = 'paid';
      order.paymentStatus = 'paid';
      order.paidAt = paid_at ? new Date(paid_at) : new Date();
      updated = true;
      console.log('✅ Order marked as PAID');

      // 🚀 Kirim notifikasi WhatsApp setelah sukses bayar
      await sendWhatsAppNotification(order);
    } else if (status === 'EXPIRED') {
      order.status = 'expired';
      updated = true;
      console.log('⏰ Order marked as EXPIRED');
    } else if (status === 'PENDING') {
      order.status = 'waiting payment';
      updated = true;
      console.log('⏳ Order status: PENDING');
    }

    if (updated) {
      order.xenditInvoiceId = id;
      order.updatedAt = new Date();
      await order.save();
      console.log('💾 Order updated successfully');
    }

    // ✅ Tetap return 200 biar Xendit gak retry
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      order_id: order._id,
      status: order.status,
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(200).json({
      success: false,
      message: error.message,
    });
  }
}
