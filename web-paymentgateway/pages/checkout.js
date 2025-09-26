import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) setCartItems(JSON.parse(storedCart));
      
      // Trigger animation
      setTimeout(() => setIsVisible(true), 100);
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
    .checkout-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%);
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      overflow-x: hidden;
    }

    /* Background decorations */
    .bg-decoration {
      position: absolute;
      border-radius: 50%;
      opacity: 0.05;
      pointer-events: none;
    }

    .bg-decoration-1 {
      top: 80px;
      left: 80px;
      width: 128px;
      height: 128px;
      background: #ca8a04;
      animation: pulse 3s infinite;
    }

    .bg-decoration-2 {
      top: 160px;
      right: 128px;
      width: 96px;
      height: 96px;
      background: #f59e0b;
      opacity: 0.1;
      animation: bounce 4s infinite;
    }

    .bg-decoration-3 {
      bottom: 128px;
      left: 25%;
      width: 64px;
      height: 64px;
      background: #eab308;
      opacity: 0.05;
      animation: ping 2s infinite;
    }

    /* Main container */
    .checkout-container {
      max-width: 1280px;
      margin: 0 auto;
      position: relative;
      z-index: 10;
      transform: translateY(32px);
      opacity: 0;
      transition: all 0.7s ease-out;
    }

    .checkout-container.visible {
      transform: translateY(0);
      opacity: 1;
    }

    /* Header section */
    .checkout-header {
      margin-bottom: 32px;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #9ca3af;
      background: none;
      border: none;
      cursor: pointer;
      margin-bottom: 16px;
      padding: 8px 0;
      transition: color 0.3s ease;
      font-size: 14px;
    }

    .back-button:hover {
      color: #fbbf24;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .page-subtitle {
      color: #9ca3af;
      font-size: 16px;
    }

    /* Main content grid */
    .checkout-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;
    }

    /* Cart section */
    .cart-section {
      background: rgba(31, 41, 55, 0.5);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(55, 65, 81, 0.5);
      height: fit-content;
    }

    .cart-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .cart-icon {
      padding: 8px;
      background: rgba(202, 138, 4, 0.2);
      border-radius: 8px;
      font-size: 20px;
    }

    .cart-title {
      font-size: 24px;
      font-weight: 700;
      color: white;
      margin: 0;
    }

    .cart-count {
      padding: 4px 12px;
      background: rgba(202, 138, 4, 0.2);
      color: #fbbf24;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    /* Cart items */
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item {
      background: rgba(17, 24, 39, 0.5);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(75, 85, 99, 0.3);
      transition: all 0.3s ease;
      transform: translateX(16px);
      opacity: 0;
      animation: slideInLeft 0.6s ease-out forwards;
    }

    .cart-item:nth-child(2) { animation-delay: 0.1s; }
    .cart-item:nth-child(3) { animation-delay: 0.2s; }
    .cart-item:nth-child(4) { animation-delay: 0.3s; }

    .cart-item:hover {
      border-color: rgba(251, 191, 36, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .item-image {
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      group: hover;
    }

    .item-image img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .cart-item:hover .item-image img {
      transform: scale(1.05);
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-size: 18px;
      font-weight: 600;
      color: white;
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-price {
      color: #fbbf24;
      font-weight: 600;
      font-size: 16px;
      margin: 0;
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(55, 65, 81, 0.5);
      border-radius: 8px;
      padding: 4px;
    }

    .quantity-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: rgba(75, 85, 99, 1);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.2s ease;
    }

    .quantity-btn:hover {
      transform: scale(1.1);
    }

    .quantity-btn.decrease:hover {
      background: #dc2626;
    }

    .quantity-btn.increase:hover {
      background: #16a34a;
    }

    .quantity-display {
      min-width: 32px;
      text-align: center;
      font-weight: 700;
      color: white;
      font-size: 16px;
    }

    .remove-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(220, 38, 38, 0.2);
      border: none;
      color: #f87171;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.2s ease;
    }

    .remove-btn:hover {
      background: rgba(220, 38, 38, 0.3);
      transform: scale(1.1);
    }

    /* Summary section */
    .summary-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .summary-card {
      background: rgba(31, 41, 55, 0.5);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(55, 65, 81, 0.5);
    }

    .summary-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .summary-icon {
      padding: 8px;
      background: rgba(217, 119, 6, 0.2);
      border-radius: 8px;
      font-size: 20px;
    }

    .summary-title {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin: 0;
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #d1d5db;
      font-size: 16px;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid rgba(75, 85, 99, 0.5);
      font-size: 18px;
      font-weight: 700;
    }

    .summary-total .label {
      color: white;
    }

    .summary-total .amount {
      color: #fbbf24;
      font-size: 20px;
    }

    /* Payment button */
    .payment-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px rgba(202, 138, 4, 0.3);
    }

    .payment-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 25px rgba(202, 138, 4, 0.4);
      background: linear-gradient(135deg, #b45309, #ea580c);
    }

    .payment-btn:disabled {
      background: rgba(75, 85, 99, 0.5);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Security badge */
    .security-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #9ca3af;
      font-size: 14px;
    }

    .security-icon {
      color: #10b981;
    }

    /* Error message */
    .error-message {
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 8px;
      padding: 16px;
      color: #f87171;
      text-align: center;
      font-weight: 600;
      margin-top: 16px;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 64px 32px;
      color: #6b7280;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: rgba(55, 65, 81, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 32px;
    }

    .empty-title {
      font-size: 18px;
      color: #9ca3af;
      margin-bottom: 8px;
    }

    .empty-subtitle {
      font-size: 14px;
      color: #6b7280;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .checkout-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      
      .page-title {
        font-size: 28px;
      }
    }

    @media (max-width: 640px) {
      .checkout-page {
        padding: 12px;
      }
      
      .cart-section,
      .summary-card {
        padding: 20px 16px;
      }
      
      .item-content {
        gap: 12px;
      }
      
      .item-image img {
        width: 64px;
        height: 64px;
      }
      
      .page-title {
        font-size: 24px;
      }
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 0.05; }
      50% { opacity: 0.1; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes ping {
      0% { transform: scale(1); opacity: 0.05; }
      75%, 100% { transform: scale(2); opacity: 0; }
    }

    @keyframes slideInLeft {
      0% {
        transform: translateX(16px);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="checkout-page">
        {/* Background decorations */}
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>
        <div className="bg-decoration bg-decoration-3"></div>

        <div className={`checkout-container ${isVisible ? 'visible' : ''}`}>
          {/* Header */}
          <div className="checkout-header">
            <button className="back-button">
              <span>←</span>
              <span>Kembali Belanja</span>
            </button>
            
            <h1 className="page-title">Checkout Pembayaran</h1>
            <p className="page-subtitle">Review pesanan dan lakukan pembayaran</p>
          </div>

          <div className="checkout-grid">
            {/* Cart Items Section */}
            <div className="cart-section">
              <div className="cart-header">
                <div className="cart-icon">🛍️</div>
                <h2 className="cart-title">Keranjang Belanja</h2>
                <span className="cart-count">{cartItems.length} item</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛍️</div>
                  <div className="empty-title">Keranjang kosong</div>
                  <div className="empty-subtitle">Tambahkan produk untuk melanjutkan</div>
                </div>
              ) : (
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                      <div className="item-content">
                        <div className="item-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        
                        <div className="item-info">
                          <h3 className="item-name">{item.name}</h3>
                          <p className="item-price">Rp {item.price.toLocaleString("id-ID")}</p>
                        </div>

                        <div className="item-controls">
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn decrease"
                              onClick={() => updateQuantity(item._id, -1)}
                            >
                              −
                            </button>
                            
                            <span className="quantity-display">{item.quantity}</span>
                            
                            <button
                              className="quantity-btn increase"
                              onClick={() => updateQuantity(item._id, 1)}
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="remove-btn"
                            onClick={() => removeItem(item._id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="summary-section">
              <div className="summary-card">
                <div className="summary-header">
                  <div className="summary-icon">📦</div>
                  <h2 className="summary-title">Ringkasan Pesanan</h2>
                </div>

                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal ({cartItems.length} item)</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Biaya Admin</span>
                    <span style={{color: '#10b981'}}>Gratis</span>
                  </div>
                </div>
                
                <div className="summary-total">
                  <span className="label">Total</span>
                  <span className="amount">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Payment Button */}
              <div className="summary-card">
                <button
                  onClick={handlePayment}
                  disabled={loading || cartItems.length === 0}
                  className="payment-btn"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      Bayar Sekarang
                    </>
                  )}
                </button>

                <div className="security-badge">
                  <span className="security-icon">🔒</span>
                  <span>Pembayaran 100% aman dan terenkripsi</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}