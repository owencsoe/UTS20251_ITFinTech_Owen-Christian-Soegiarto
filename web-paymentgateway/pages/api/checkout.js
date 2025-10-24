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
      status: 'waiting payment',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Buat invoice Xendit
    let xenditInvoice = null;
    try {
      xenditInvoice = await createXenditInvoice(order);
      
      // Update order dengan invoice URL - GANTI paymentUrl jadi invoiceUrl
      order.invoiceUrl = xenditInvoice.invoice_url;
      order.xenditInvoiceId = xenditInvoice.id;
      await order.save();
    } catch (error) {
      console.error('Error creating Xendit invoice:', error);
      // Hapus order jika gagal buat invoice
      await Order.findByIdAndDelete(order._id);
      return res.status(500).json({ 
        message: 'Gagal membuat invoice pembayaran',
        error: error.message 
      });
    }

    // Kirim notifikasi WhatsApp dengan link pembayaran
    try {
      await sendCheckoutNotification(order, xenditInvoice.invoice_url);
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
        status: order.status,
        invoiceUrl: xenditInvoice.invoice_url  // GANTI dari paymentUrl
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

async function createXenditInvoice(order) {
  const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
  
  if (!XENDIT_SECRET_KEY) {
    throw new Error('XENDIT_SECRET_KEY not configured');
  }

  // Format nomor HP (hilangkan karakter non-digit, tambahkan +62)
  let formattedPhone = order.phone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('8')) {
    formattedPhone = '62' + formattedPhone;
  } else if (!formattedPhone.startsWith('62')) {
    formattedPhone = '62' + formattedPhone;
  }

  const invoiceData = {
    external_id: order.externalId,
    amount: order.totalAmount,
    payer_email: order.email,
    description: `Pembayaran Order ${order.externalId}`,
    invoice_duration: 86400, // 24 jam
    customer: {
      given_names: order.customerName,
      email: order.email,
      mobile_number: `+${formattedPhone}`
    },
    customer_notification_preference: {
      invoice_created: ['email', 'whatsapp'],
      invoice_reminder: ['email', 'whatsapp'],
      invoice_paid: ['email', 'whatsapp']
    },
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      category: 'Product'
    })),
    success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?order_id=${order._id}`,
    failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-failed?order_id=${order._id}`
  };

  try {
    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Xendit invoice');
    }

    const data = await response.json();
    console.log('✅ Xendit invoice created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Xendit API error:', error);
    throw error;
  }
}

async function sendCheckoutNotification(order, paymentUrl) {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  
  if (!FONNTE_TOKEN) {
    console.error('❌ FONNTE_TOKEN not configured');
    throw new Error('FONNTE_TOKEN not configured');
  }

  // FORMAT NOMOR TELEPON - INI PENTING!
  let targetPhone = order.phone.replace(/\D/g, ''); // Hapus semua karakter non-digit
  
  // Normalisasi format nomor
  if (targetPhone.startsWith('0')) {
    targetPhone = '62' + targetPhone.substring(1);
  } else if (targetPhone.startsWith('8')) {
    targetPhone = '62' + targetPhone;
  } else if (!targetPhone.startsWith('62')) {
    targetPhone = '62' + targetPhone;
  }

  console.log('📱 Original phone:', order.phone);
  console.log('📱 Formatted phone:', targetPhone);

  const itemsList = order.items.map((item, index) => 
    `${index + 1}. ${item.name} x${item.quantity} - Rp${(item.price * item.quantity).toLocaleString('id-ID')}`
  ).join('\n');

  const message = `🛍️ *PESANAN BARU - PHAMIE*\n\n` +
    `Terima kasih ${order.customerName}! 🎉\n\n` +
    `*Nomor Order:* ${order.externalId}\n\n` +
    `*Detail Pesanan:*\n${itemsList}\n\n` +
    `*Total Pembayaran:* Rp${order.totalAmount.toLocaleString('id-ID')}\n\n` +
    `*Alamat Pengiriman:*\n${order.address}\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `💳 *LINK PEMBAYARAN:*\n${paymentUrl}\n\n` +
    `⏰ Link berlaku selama 24 jam\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `Status: ⏳ Menunggu Pembayaran\n\n` +
    `Silakan klik link di atas untuk melakukan pembayaran.\n` +
    `Pesanan akan diproses setelah pembayaran berhasil.\n\n` +
    `Terima kasih telah berbelanja di PHAMIE! 💛`;

  const payload = {
    target: targetPhone,  // PAKE targetPhone, BUKAN order.phone
    message: message,
    countryCode: '62'
  };

  console.log('📤 Sending to Fonnte:', payload.target);

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('📥 Fonnte Response Status:', response.status);
    console.log('📥 Fonnte Response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse Fonnte response');
      throw new Error(`Invalid response from Fonnte: ${responseText}`);
    }

    if (!response.ok || data.status === false) {
      console.error('❌ Fonnte API Error:', data);
      throw new Error(data.reason || data.message || 'Failed to send WhatsApp');
    }

    console.log('✅ WhatsApp notification sent successfully!');
    return data;
  } catch (error) {
    console.error('❌ Fonnte error:', error.message);
    throw error;
  }
}