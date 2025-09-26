import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) setCartItems(JSON.parse(storedCart));
    } catch (err) {
      console.error("❌ Error parsing cart:", err);
      setError("Keranjang tidak valid");
    }
  }, []);

  const updateQuantity = (id, change) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) => {
          if (item._id === id) {
            const newQty = item.quantity + change;
            return newQty <= 0 ? null : { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item._id !== id);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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

      if (!res.ok) throw new Error("Gagal membuat invoice");

      const data = await res.json();
      if (data.invoiceUrl) window.location.href = data.invoiceUrl;
      else setError("Invoice tidak valid: " + JSON.stringify(data));
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setError(err.message || "Terjadi kesalahan saat checkout");
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    .page-container {
      min-height: 100vh;
      background: #0d0d0d;
      color: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      padding: 48px 24px;
    }

    .card {
      background: #1a1a1a;
      border-radius: 20px;
      padding: 32px;
      max-width: 900px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .checkout-header {
      font-size: 36px;
      font-weight: 700;
      color: #f5f5f5;
      text-align: center;
      margin-bottom: 16px;
    }

    .checkout-body {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .my-bag {
      flex: 2;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 16px;
      border: 1px solid rgba(139,116,79,0.1);
      border-radius: 12px;
      transition: background 0.3s ease;
      background: #1a1a1a;
    }

    .cart-item:hover { background: rgba(139,116,79,0.1); }

    .cart-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .cart-item-info {
      flex: 1;
      min-width: 0;
    }

    .cart-item-info h2 { font-size: 18px; font-weight: 600; color: #f5f5f5; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cart-item-info p { font-size: 16px; color: #8b744f; margin: 0; }

    .quantity-controls { display: flex; align-items: center; gap: 8px; }
    .quantity-button {
      width: 32px; height: 32px; border-radius: 50%;
      border: 1px solid rgba(139,116,79,0.3);
      color: #8b744f; display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 18px;
      background: rgba(139,116,79,0.1); transition: all 0.3s ease;
    }
    .quantity-button:hover { transform: scale(1.1); background: rgba(139,116,79,0.2); border-color: rgba(139,116,79,0.5); }
    .quantity-display { min-width: 24px; text-align: center; font-weight: bold; color: #f5f5f5; }

    .remove-button { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 20px; margin-left: 8px; transition: all 0.3s ease; }
    .remove-button:hover { transform: scale(1.1); }

    .summary {
      flex: 1;
      background: #1a1a1a;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border: 1px solid rgba(139,116,79,0.1);
    }

    .summary h2 { font-size: 24px; font-weight: 700; color: #f5f5f5; margin: 0; }
    .summary-row { display: flex; justify-content: space-between; font-size: 16px; color: #f5f5f5; margin-bottom: 8px; }
    .btn { width: 100%; padding: 16px; background: #8b744f; color: #fff; font-size: 18px; font-weight: bold; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; }
    .btn:hover { background: #9d8359; transform: scale(1.02); }
    .btn:disabled { background: rgba(139,116,79,0.3); cursor: not-allowed; transform: none; }

    .info-note { font-size: 14px; color: #888; }

    .error { margin-top: 16px; color: #ef4444; font-weight: 600; text-align: center; }
    .empty-text { text-align: center; color: #888; margin: 48px 0; font-size: 18px; }

    @media(max-width:768px){ .checkout-body { flex-direction: column; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="page-container">
        <div className="card">
          <h1 className="checkout-header">Checkout Pembayaran</h1>
          <div className="checkout-body">
            <div className="my-bag">
              {cartItems.length === 0 ? (
                <p className="empty-text">Keranjang kosong.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="cart-item-info">
                      <h2>{item.name}</h2>
                      <p>Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="quantity-controls">
                      <button className="quantity-button" onClick={() => updateQuantity(item._id, -1)}>−</button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button className="quantity-button" onClick={() => updateQuantity(item._id, 1)}>+</button>
                    </div>
                    <button className="remove-button" onClick={() => removeItem(item._id)}>✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="summary">
              <h2>Total</h2>
              <div className="summary-row">
                <span>Sub-total</span>
                <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <button onClick={handlePayment} disabled={loading || cartItems.length === 0} className="btn">
                {loading ? "Memproses..." : "Bayar Sekarang"}
              </button>

            </div>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </>
  );
}
