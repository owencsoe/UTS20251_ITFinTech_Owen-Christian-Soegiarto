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

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="page-container">
      <div className="card">
        {/* Judul */}
        <h1 className="page-title">Pilih Produk</h1>

        {/* List Produk */}
        {products.length === 0 ? (
          <p className="empty-text">Tidak ada produk tersedia.</p>
        ) : (
          <div>
            {products.map((p) => (
              <div key={p._id} className="cart-item">
                <h2>{p.name}</h2>
                <p className="price">Rp {p.price.toLocaleString("id-ID")}</p>
                <button
                  className="btn"
                  style={{ marginTop: "10px" }}
                  onClick={() => addToCart(p)}
                >
                  Tambah ke Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Cart */}
        <h2 className="page-title" style={{ fontSize: "22px", marginTop: "30px" }}>
          Keranjang
        </h2>
        {cart.length === 0 ? (
          <p className="empty-text">Keranjang masih kosong.</p>
        ) : (
          <>
            {cart.map((c, i) => (
              <div key={i} className="cart-item">
                <h2>{c.name}</h2>
                <p className="price">Rp {c.price.toLocaleString("id-ID")}</p>
              </div>
            ))}

            <div className="cart-total">
              <span>Total:</span>
              <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>

            {/* Tombol ke checkout */}
            <Link
              className="btn"
              href={{
                pathname: "/checkout",
                query: { cart: JSON.stringify(cart) },
              }}
            >
              Pergi ke Checkout
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
