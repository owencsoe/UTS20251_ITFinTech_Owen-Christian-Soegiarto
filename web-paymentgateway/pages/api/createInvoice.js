import { Xendit } from "xendit-node";
import connectDB from "../../lib/mongodb";  // FIX path
import Order from "../../models/order";     // FIX path

const x = new Xendit({
  secretKey: "xnd_development_BrNmc7AafQxmhv3PvO64fXpIQRTZzrPGB9KiYcaIJsHqGnr68kw3xmzuAnfqNJ",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { amount, description, items } = req.body;

    try {
      await connectDB();

      const externalId = "order-" + Date.now();

      // Simpan order
      await Order.create({
        externalId,
        items: items || [],
        total: Number(amount),
        status: "PENDING",
      });

      const payload = {
        externalId,
        amount: Number(amount),
        description: description || "Pembayaran UTS",
        payerEmail: "test@example.com",
        successRedirectUrl: "http://localhost:3000/payment-success",
        failureRedirectUrl: "http://localhost:3000/payment-failed",
      };

      const response = await x.Invoice.createInvoice({ data: payload });

      res.status(200).json(response.data || response);
    } catch (err) {
      console.error("❌ Error create invoice:", err.response?.data || err.message || err);
      res.status(500).json({ error: "Gagal membuat invoice" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
