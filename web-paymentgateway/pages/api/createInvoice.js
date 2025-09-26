import { Xendit } from "xendit-node";

const x = new Xendit({
  secretKey: "xnd_development_BrNmc7AafQxmhv3PvO64fXpIQRTZzrPGB9KiYcaIJsHqGnr68kw3xmzuAnfqNJ",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { amount, description } = req.body;

    try {
      const payload = {
        externalId: "order-" + Date.now(),
        amount: Number(amount),
        description: description || "Pembayaran UTS",
        payerEmail: "test@example.com",
        successRedirectUrl: "http://localhost:3000/payment-success",
        failureRedirectUrl: "http://localhost:3000/payment-failed",
      };

      console.log("Payload ke Xendit v7:", payload);

      const response = await x.Invoice.createInvoice({ data: payload });

      console.log("Response dari Xendit:", response);

      // pastikan selalu return JSON valid
      res.status(200).json(response.data || response);
    } catch (err) {
      console.error("❌ Error create invoice:", err.response?.data || err);
      res.status(500).json({ error: "Gagal membuat invoice" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
