import connectDB from "@/lib/mongodb";
import Product from "@/models/product";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      console.error("❌ Gagal ambil produk:", error);
      res.status(500).json({ error: "Gagal mengambil produk" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
