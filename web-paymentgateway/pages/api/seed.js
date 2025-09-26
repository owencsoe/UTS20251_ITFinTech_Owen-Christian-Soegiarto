import connectDB from "@/lib/mongodb";
import Product from "@/models/product";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const products = [
      { name: "Kopi Hitam", category: "Minuman", price: 20000 },
      { name: "Teh Manis", category: "Minuman", price: 15000 },
      { name: "Nasi Goreng", category: "Makanan", price: 35000 },
    ];

    await Product.insertMany(products);
    return res.status(200).json({ message: "Products seeded!" });
  }

  res.status(405).json({ message: "Method not allowed" });
}
