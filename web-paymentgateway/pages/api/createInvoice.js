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
