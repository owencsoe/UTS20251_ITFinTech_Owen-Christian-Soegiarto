// models/order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  items: [{ name: String, price: Number }],
  total: Number,
  status: { type: String, default: "PENDING" }, // PENDING | PAID | EXPIRED
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
