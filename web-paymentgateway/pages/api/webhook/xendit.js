// pages/api/webhook/xendit.js
import connectDB from "../../../lib/mongodb";
import Order from "../../../models/order";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const event = req.body;
    console.log("🔔 Webhook diterima:", event);

    const { external_id, status } = event;

    // Update order di DB
    await Order.findOneAndUpdate(
      { externalId: external_id },
      { status },
      { new: true }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error webhook:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
