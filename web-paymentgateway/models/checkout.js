import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema({
  products: [{ name: String, price: Number }],
  totalPrice: Number,
  status: { type: String, default: "PENDING" }, // bisa PENDING atau LUNAS
});

export default mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema);
