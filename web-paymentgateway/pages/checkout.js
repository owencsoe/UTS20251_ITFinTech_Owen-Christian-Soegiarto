import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      console.log("🛒 Cart data loaded:", cartData);
      setCart(cartData);
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const updateQuantity = (id, change) => {
    setCart(prev => {
      const updated = prev
        .map(item => item._id === id ? {...item, quantity: item.quantity + change} : item)
        .filter(item => item.quantity > 0);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = id => {
    const updated = cart.filter(item => item._id !== id);
    localStorage.setItem('cart', JSON.stringify(updated));
    setCart(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (cart.length === 0) {
      setError('Keranjang kosong!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/createInvoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          totalAmount: getTotalPrice(),
          items: cart.map(item => ({
            productId: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          })),
          description: `Pembayaran oleh ${formData.customerName}`,
        }),
      });

      const data = await response.json();
      console.log('📦 Response:', data);

      if (data.success && data.invoiceUrl) {
        // ✅ Clear cart
        localStorage.removeItem('cart');
        
        // ✅ REDIRECT KE XENDIT PAYMENT PAGE
        console.log('🚀 Redirecting to:', data.invoiceUrl);
        window.location.href = data.invoiceUrl;
      } else {
        setError(data.message || 'Gagal membuat order');
      }
    } catch (err) {
      console.error('❌ Checkout error:', err);
      setError('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    * {margin:0;padding:0;box-sizing:border-box;}
    body {font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
    .checkout-page {min-height:100vh;background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 50%,#000 100%);padding:40px 20px;}
    .checkout-container {max-width:1200px;margin:0 auto;opacity:0;transform:translateY(20px);transition:all 0.7s ease-out;}
    .checkout-container.visible {opacity:1;transform:translateY(0);}
    .checkout-header {margin-bottom:40px;}
    .back-button {display:inline-flex;align-items:center;gap:8px;color:#9ca3af;background:none;border:none;cursor:pointer;margin-bottom:16px;padding:8px 0;font-size:14px;}
    .back-button:hover {color:#fbbf24;}
    .page-title {font-size:48px;font-weight:800;background:linear-gradient(135deg,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:12px;}
    .page-subtitle {color:#9ca3af;font-size:16px;}
    .checkout-grid {display:grid;grid-template-columns:1fr 400px;gap:32px;}
    .form-section,.summary-section {background:rgba(31,41,55,0.8);backdrop-filter:blur(20px);border:1px solid rgba(251,191,36,0.2);border-radius:20px;padding:32px;}
    .summary-section {height:fit-content;position:sticky;top:20px;}
    .section-title {font-size:20px;font-weight:700;color:#fbbf24;margin-bottom:24px;display:flex;align-items:center;gap:12px;}
    .form-group {margin-bottom:20px;}
    .form-label {display:block;color:#e5e7eb;font-weight:600;font-size:14px;margin-bottom:8px;}
    .form-input {width:100%;padding:14px 16px;background:rgba(17,24,39,0.8);border:1px solid rgba(251,191,36,0.2);border-radius:12px;color:#f9fafb;font-size:15px;transition:all 0.3s ease;}
    .form-input:focus {outline:none;border-color:rgba(251,191,36,0.5);box-shadow:0 0 0 3px rgba(251,191,36,0.1);}
    .cart-items {max-height:300px;overflow-y:auto;margin-bottom:24px;}
    .cart-item {display:flex;gap:16px;padding:16px;border-radius:12px;background:rgba(17,24,39,0.6);border:1px solid rgba(251,191,36,0.1);align-items:center;margin-bottom:12px;}
    .item-image {width:60px;height:60px;object-fit:cover;border-radius:8px;}
    .item-info {flex:1;}
    .item-name {font-weight:600;color:#f9fafb;margin-bottom:4px;font-size:14px;}
    .item-details {color:#9ca3af;font-size:13px;}
    .item-price {color:#fbbf24;font-weight:700;font-size:15px;text-align:right;}
    .quantity-controls {display:flex;align-items:center;gap:8px;margin-top:8px;}
    .quantity-btn {width:28px;height:28px;border-radius:6px;border:none;background:rgba(75,85,99,0.5);color:white;cursor:pointer;font-weight:bold;transition:all 0.2s ease;}
    .quantity-btn:hover {transform:scale(1.1);}
    .quantity-btn.decrease:hover {background:#dc2626;}
    .quantity-btn.increase:hover {background:#16a34a;}
    .quantity-display {min-width:32px;text-align:center;font-weight:600;color:#f9fafb;}
    .remove-btn {padding:6px 12px;background:rgba(220,38,38,0.2);border:1px solid rgba(220,38,38,0.3);color:#f87171;border-radius:6px;cursor:pointer;font-size:12px;transition:all 0.2s ease;}
    .remove-btn:hover {background:rgba(220,38,38,0.3);}
    .total-section {padding-top:24px;border-top:2px solid rgba(251,191,36,0.2);margin-bottom:24px;}
    .total-row {display:flex;justify-content:space-between;margin-bottom:12px;font-size:15px;}
    .total-label {color:#9ca3af;}
    .total-value {color:#f9fafb;font-weight:600;}
    .grand-total {display:flex;justify-content:space-between;padding-top:16px;border-top:1px solid rgba(251,191,36,0.1);}
    .grand-total-label {color:#e5e7eb;font-weight:700;font-size:16px;}
    .grand-total-value {font-size:24px;font-weight:700;background:linear-gradient(135deg,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .error-message {background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:12px 16px;border-radius:12px;font-size:14px;margin-bottom:20px;}
    .submit-button {width:100%;padding:16px;background:linear-gradient(135deg,#ca8a04,#d97706);color:white;font-weight:700;font-size:16px;border:none;border-radius:12px;cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;gap:8px;}
    .submit-button:hover:not(:disabled) {background:linear-gradient(135deg,#b45309,#ea580c);transform:translateY(-2px);box-shadow:0 8px 25px rgba(202,138,4,0.3);}
    .submit-button:disabled {opacity:0.6;cursor:not-allowed;}
    .empty-state {text-align:center;padding:60px 24px;color:#9ca3af;}
    .empty-icon {font-size:48px;margin-bottom:16px;}
    @media (max-width:968px) {.checkout-grid {grid-template-columns:1fr;}.summary-section {position:static;}}
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="checkout-page">
        <div className={`checkout-container ${isVisible ? 'visible' : ''}`}>
          <div className="checkout-header">
            <button className="back-button" onClick={() => router.push('/')}>
              <span>←</span> <span>Kembali Belanja</span>
            </button>
            <h1 className="page-title">🛒 Checkout</h1>
            <p className="page-subtitle">Lengkapi data Anda untuk menyelesaikan pembelian</p>
          </div>

          <div className="checkout-grid">
            <div className="form-section">
              <h2 className="section-title">📋 Data Pembeli</h2>
              {error && <div className="error-message">⚠ {error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Telepon</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Jl. Contoh No.123, Jakarta"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? '⏳ Memproses...' : '💳 Bayar Sekarang'}
                </button>
              </form>
            </div>

            <div className="summary-section">
              <h2 className="section-title">📦 Ringkasan Pesanan</h2>
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🛍️</div>
                    <div>Keranjang kosong</div>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item._id} className="cart-item">
                      <img src={item.image} alt={item.name} className="item-image" />
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-details">
                          Rp{item.price.toLocaleString('id-ID')}
                        </div>
                        <div className="quantity-controls">
                          <button type="button" className="quantity-btn decrease" onClick={() => updateQuantity(item._id, -1)}>−</button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button type="button" className="quantity-btn increase" onClick={() => updateQuantity(item._id, 1)}>+</button>
                          <button type="button" className="remove-btn" onClick={() => removeItem(item._id)}>Hapus</button>
                        </div>
                      </div>
                      <div className="item-price">
                        Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="total-section">
                <div className="total-row">
                  <span className="total-label">Subtotal</span>
                  <span className="total-value">Rp{getTotalPrice().toLocaleString('id-ID')}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Biaya Admin</span>
                  <span className="total-value">Rp0</span>
                </div>
                <div className="grand-total">
                  <span className="grand-total-label">Total Pembayaran</span>
                  <span className="grand-total-value">
                    Rp{getTotalPrice().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}