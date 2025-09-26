import connectDB from "@/lib/mongodb";
import Product from "@/models/product";
import Link from "next/link";

export async function getServerSideProps() {
  await connectDB();
  const products = await Product.find().lean();
  return { props: { products: JSON.parse(JSON.stringify(products)) } };
}

export default function Home({ products }) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Pilih Produk</h1>
      <ul>
        {products.map((p) => (
          <li key={p._id}>
            {p.name} - Rp{p.price}
          </li>
        ))}
      </ul>

      <Link href="/checkout">Pergi ke Checkout</Link>
    </div>
  );
}
