import connectDB from "@/lib/mongodb";
import Product from "@/models/product";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const products = [
      { name: "Kopi Hitam", category: "Minuman", price: 20000, image: "/kopi.jpeg" },
      { name: "Teh Manis", category: "Minuman", price: 15000, image: "/tehmanis.jpg" },
      { name: "Nasi Goreng", category: "Makanan", price: 35000, image: "/nasgor.jpg" },
      { name: "Mie Ayam", category: "Makanan", price: 30000, image: "/mie.jpeg" },
      { name: "Jus Alpukat", category: "Minuman", price: 25000, image: "/jus.jpeg" },
      { name: "Roti Bakar", category: "Makanan", price: 20000, image: "/roti.jpg" },
      { name: "Sate Ayam", category: "Makanan", price: 40000, image: "/sate.jpeg" },
    ];

    await Product.insertMany(products);
    return res.status(200).json({ message: "Products seeded!" });
  }

  res.status(405).json({ message: "Method not allowed" });
}
