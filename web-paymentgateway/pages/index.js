import { useState } from "react";
import connectDB from "../lib/mongodb";
import Product from "../models/product";
import Link from "next/link";

export async function getServerSideProps() {
  await connectDB();
  const products = await Product.find().lean();
  return { props: { products: JSON.parse(JSON.stringify(products)) } };
}

export default function Home({ products }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pilih Produk</h1>
      <ul>
        {products.map((p) => (
          <li key={p._id}>
            {p.name} - Rp{p.price.toLocaleString("id-ID")}
            <button
              onClick={() => addToCart(p)}
              style={{ marginLeft: "10px" }}
            >
              Tambah ke Cart
            </button>
          </li>
        ))}
      </ul>

      <h2>Cart</h2>
      <ul>
        {cart.map((c, i) => (
          <li key={i}>
            {c.name} - Rp{c.price.toLocaleString("id-ID")}
          </li>
        ))}
      </ul>

      {cart.length > 0 && (
        <Link
          href={{
            pathname: "/checkout",
            query: { cart: JSON.stringify(cart) },
          }}
        >
          Pergi ke Checkout
        </Link>
      )}
    </div>
  );
}
