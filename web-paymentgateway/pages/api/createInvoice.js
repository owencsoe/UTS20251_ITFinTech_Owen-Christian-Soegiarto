import { Xendit } from "xendit-node";
import connectDB from "../../lib/mongodb";
import Order from "../../models/order";

// 🔑 Gunakan SECRET KEY dari Xendit Dashboard (Test / Live)
const x = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || "xnd_development_BrNmc7AafQxmhv3PvO64fXpIQRTZzrPGB9KiYcaIJsHqGnr68kw3xmzuAnfqNJ",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { customerName, email, phone, address, totalAmount, items, description } = req.body;

    // ✅ Validasi data wajib
    if (!customerName || !email || !phone || !totalAmount || !items?.length) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap. Pastikan semua field wajib terisi.",
      });
    }

    // ✅ Buat ID unik order
    const externalId = "order-" + Date.now();

    // ✅ Payload buat Xendit
    const payload = {
      externalId,
      amount: Number(totalAmount),
      description: description || `Pembayaran oleh ${customerName}`,
      payerEmail: email,
      successRedirectUrl: "http://localhost:3000/payment-success",
      failureRedirectUrl: "http://localhost:3000/payment-failed",
    };

    console.log("📤 Sending to Xendit:", payload);

    // ✅ Buat invoice di Xendit
    const response = await x.Invoice.createInvoice({ data: payload });
    console.log("🧾 Full Xendit Response:", JSON.stringify(response, null, 2));

    // ✅ Ambil data utama dari response (handle berbagai format)
    const invoiceData =
      response?.data?.id ? response.data :
      response?.id ? response :
      response?.data || response;

    console.log("✅ Xendit invoice created:", invoiceData.id);
    console.log("🔗 Invoice URL:", invoiceData.invoiceUrl || invoiceData.invoice_url || invoiceData.url || "❌ Tidak ditemukan");

    // ✅ Simpan order ke database
    const order = await Order.create({
      externalId,
      xenditInvoiceId: invoiceData.id,
      invoiceUrl: invoiceData.invoiceUrl || invoiceData.invoice_url || invoiceData.url,
      customerName,
      email,
      phone,
      address,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      })),
      totalAmount: Number(totalAmount),
      status: "waiting payment",
    });

    console.log("✅ Order saved:", order._id);

    // 📲 KIRIM WHATSAPP NOTIFICATION - TAMBAHKAN INI! 👇
    try {
      console.log("📲 Attempting to send WhatsApp notification...");
      const invoiceUrl = invoiceData.invoiceUrl || invoiceData.invoice_url || invoiceData.url;
      await sendCheckoutNotification(order, invoiceUrl);
    } catch (error) {
      console.error("❌ Error sending WhatsApp notification:", error.message);
      // Tetap lanjut meskipun notifikasi gagal
    }
    // 👆 SAMPAI SINI

    // ✅ Kirim ke frontend
    return res.status(200).json({
      success: true,
      message: "Invoice berhasil dibuat",
      orderId: order._id,
      xenditInvoiceId: invoiceData.id,
      invoiceUrl: invoiceData.invoiceUrl || invoiceData.invoice_url || invoiceData.url,
      externalId: externalId,
    });

  } catch (err) {
    console.error("❌ Error create invoice:", err.response?.data || err.message || err);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat invoice",
      error: err.message || "Unknown error",
    });
  }
}

// 📲 FUNGSI KIRIM WHATSAPP - TAMBAHKAN FUNGSI INI! 👇
async function sendCheckoutNotification(order, paymentUrl) {
  console.log("🔍 === START SEND WHATSAPP NOTIFICATION ===");
  
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  
  console.log("🔑 FONNTE_TOKEN exists:", !!FONNTE_TOKEN);
  console.log("🔑 FONNTE_TOKEN length:", FONNTE_TOKEN?.length);
  console.log("💰 Payment URL:", paymentUrl);
  
  if (!FONNTE_TOKEN) {
    console.error("❌ FONNTE_TOKEN not configured in .env");
    throw new Error("FONNTE_TOKEN not configured");
  }

  // FORMAT NOMOR TELEPON
  let targetPhone = order.phone.replace(/\D/g, ""); // Hapus semua karakter non-digit
  
  if (targetPhone.startsWith("0")) {
    targetPhone = "62" + targetPhone.substring(1);
  } else if (targetPhone.startsWith("8")) {
    targetPhone = "62" + targetPhone;
  } else if (!targetPhone.startsWith("62")) {
    targetPhone = "62" + targetPhone;
  }

  console.log("📱 Original phone:", order.phone);
  console.log("📱 Formatted phone:", targetPhone);

  const itemsList = order.items.map((item, index) => 
    `${index + 1}. ${item.name} x${item.quantity} - Rp${(item.price * item.quantity).toLocaleString("id-ID")}`
  ).join("\n");

  const message = `🛍️ *PESANAN BARU - PHAMIE*\n\n` +
    `Terima kasih ${order.customerName}! 🎉\n\n` +
    `*Nomor Order:* ${order.externalId}\n\n` +
    `*Detail Pesanan:*\n${itemsList}\n\n` +
    `*Total Pembayaran:* Rp${order.totalAmount.toLocaleString("id-ID")}\n\n` +
    `*Alamat Pengiriman:*\n${order.address || "-"}\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `💳 *LINK PEMBAYARAN:*\n${paymentUrl}\n\n` +
    `⏰ Link berlaku selama 24 jam\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `Status: ⏳ Menunggu Pembayaran\n\n` +
    `Silakan klik link untuk melakukan pembayaran.\n` +
    `Pesanan akan diproses setelah pembayaran berhasil.\n\n` +
    `Terima kasih telah berbelanja di PHAMIE! 💛`;

  const payload = {
    target: targetPhone,
    message: message,
    countryCode: "62"
  };

  console.log("📤 WhatsApp Payload:", JSON.stringify(payload, null, 2));

  try {
    console.log("🌐 Calling Fonnte API...");
    
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": FONNTE_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("📥 Fonnte Response status:", response.status);
    console.log("📥 Fonnte Response ok:", response.ok);

    const responseText = await response.text();
    console.log("📥 Fonnte Response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("📥 Fonnte Parsed data:", JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("❌ Failed to parse Fonnte response:", e.message);
      throw new Error(`Invalid response from Fonnte: ${responseText}`);
    }

    if (!response.ok) {
      console.error("❌ Fonnte returned error status:", response.status);
      console.error("❌ Error data:", data);
      throw new Error(data.reason || data.message || "Failed to send WhatsApp");
    }

    if (data.status === false || data.detail === false) {
      console.error("❌ Fonnte status false:", data);
      throw new Error(data.reason || "Message failed to send");
    }

    console.log("✅ WhatsApp notification sent successfully!");
    console.log("🔍 === END SEND WHATSAPP NOTIFICATION ===");
    return data;
    
  } catch (error) {
    console.error("❌ Fonnte error:", error.message);
    console.error("❌ Full error:", error);
    console.log("🔍 === END SEND WHATSAPP NOTIFICATION (ERROR) ===");
    throw error;
  }
}