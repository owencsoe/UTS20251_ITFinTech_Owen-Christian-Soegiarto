import connectDB from "../../../lib/mongodb";
import Order from "../../../models/order";

export default async function handler(req, res) {
  await connectDB(); // pastikan koneksi MongoDB siap
  const { id } = req.query;

  try {
    switch (req.method) {
      // -------------------- GET ORDER BY ID --------------------
      case "GET": {
        const order = await Order.findById(id).populate("items.productId");
        if (!order) {
          return res
            .status(404)
            .json({ success: false, message: "Order tidak ditemukan" });
        }

        return res.status(200).json({ success: true, order });
      }

      // -------------------- UPDATE ORDER --------------------
      case "PUT": {
        const { status, paymentProof } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (paymentProof) updateData.paymentProof = paymentProof;
        updateData.updatedAt = Date.now();

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
          new: true,
        });

        if (!updatedOrder) {
          return res
            .status(404)
            .json({ success: false, message: "Order tidak ditemukan" });
        }

        return res.status(200).json({
          success: true,
          message: "Order berhasil diupdate",
          order: updatedOrder,
        });
      }

      // -------------------- DELETE ORDER --------------------
      case "DELETE": {
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
          return res
            .status(404)
            .json({ success: false, message: "Order tidak ditemukan" });
        }

        return res.status(200).json({
          success: true,
          message: "Order berhasil dihapus",
        });
      }

      // -------------------- METHOD NOT ALLOWED --------------------
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Order API error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
}
