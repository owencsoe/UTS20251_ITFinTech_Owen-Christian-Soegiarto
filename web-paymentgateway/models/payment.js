import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  checkoutId: String,
  amount: Number,
  status: { type: String, default: "PENDING" }, // PENDING atau LUNAS
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
