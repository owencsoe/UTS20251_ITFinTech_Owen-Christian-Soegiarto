import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = router.query;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ambil cart dari query
  useEffect(() => {
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        setCartItems(parsedCart);
      } catch (err) {
        console.error("❌ Error parsing cart:", err);
        setError("Keranjang tidak valid");
      }
    }
  }, [cart]);

  // Hitung total
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  // Handle pembayaran
  const handlePayment = async () => {
    if (cartItems.length === 0) {
      setError("⚠️ Keranjang kosong, pilih produk dulu!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/createInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          description: `Pembelian ${cartItems.length} barang`,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Gagal memanggil API createInvoice");
      }

      const data = await res.json();
      console.log("Invoice response:", data);

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        setError("Invoice tidak valid: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setError(err.message || "Terjadi kesalahan saat checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        {/* Judul */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Checkout Pembayaran
        </h1>

        {/* List cart */}
        {cartItems.length === 0 ? (
          <p className="text-gray-600 text-center">Keranjang kosong</p>
        ) : (
          <div className="space-y-4 mb-6">
            {cartItems.map((item, i) => (
              <div
                key={i}
                className="p-4 border rounded-lg bg-gray-50"
              >
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="text-green-600 font-bold">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
            ))}

            <div className="p-4 border-t font-bold text-xl flex justify-between">
              <span>Total:</span>
              <span className="text-green-600">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}

        {/* Tombol bayar */}
        <button
          onClick={handlePayment}
          disabled={loading || cartItems.length === 0}
          className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          }`}
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-center mt-4 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
