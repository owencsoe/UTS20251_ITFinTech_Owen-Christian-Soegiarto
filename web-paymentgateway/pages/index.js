import { useState } from "react";
import connectDB from "../lib/mongodb";
import Product from "../models/product";
import { useRouter } from "next/router";


// Ambil data dari MongoDB
export async function getServerSideProps() {
  await connectDB();
  const products = await Product.find().lean();
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}

export default function Home({ products }) {
  const [cart, setCart] = useState([]);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const router = useRouter();

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    setJustAdded(product._id);
    setShowCartPopup(true);

    setTimeout(() => setJustAdded(null), 2000);
  };

  const updateQuantity = (productId, change) => {
    setCart(
      cart
        .map((item) => {
          if (item._id === productId) {
            const newQuantity = item.quantity + change;
            return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item._id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/checkout");
  };

  const styles = `
    .main-container {
      min-height: 100vh;
      background: #0d0d0d;
      color: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .header {
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(139, 116, 79, 0.2);
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #8b744f, #a67c52);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f5f5f5;
      font-size: 28px;
      font-weight: bold;
      box-shadow: 0 8px 25px rgba(139, 116, 79, 0.3);
    }

    .logo-text {
      font-size: 32px;
      font-weight: 700;
      color: #f5f5f5;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .logo-subtitle {
      font-size: 14px;
      color: #999;
      margin: 0;
    }

    .cart-button {
      position: relative;
      padding: 16px;
      background: rgba(139, 116, 79, 0.15);
      border: 1px solid rgba(139, 116, 79, 0.3);
      color: #8b744f;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 26px;
    }

    .cart-button:hover {
      background: rgba(139, 116, 79, 0.25);
      border-color: rgba(139, 116, 79, 0.5);
      transform: scale(1.05);
    }

    .cart-counter {
      position: absolute;
      top: -12px;
      right: -12px;
      background: #8b744f;
      color: white;
      font-size: 14px;
      font-weight: bold;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 64px;
    }

    .hero-title {
      font-size: 80px;
      font-weight: bold;
      color: #f5f5f5;
      margin: 0 0 24px 0;
      line-height: 1.1;
    }

    .hero-subtitle {
      font-size: 24px;
      color: #999;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 32px;
    }

    .product-card {
      background: #1a1a1a;
      border: 1px solid rgba(139, 116, 79, 0.15);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.5s ease;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-8px);
      border-color: rgba(139, 116, 79, 0.4);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }

    .product-image-container {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.7s ease;
    }

    .product-card:hover .product-image {
      transform: scale(1.1);
    }

    .product-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover .product-overlay {
      opacity: 1;
    }

    .product-category {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      color: #8b744f;
      font-size: 12px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 25px;
      border: 1px solid rgba(139, 116, 79, 0.3);
    }

    .product-info {
      padding: 24px;
    }

    .product-name {
      font-weight: 600;
      font-size: 24px;
      color: #f5f5f5;
      margin: 0 0 16px 0;
      transition: color 0.3s ease;
      line-height: 1.3;
    }

    .product-card:hover .product-name {
      color: #8b744f;
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .product-price {
      font-size: 32px;
      font-weight: bold;
      color: #8b744f;
    }

    .add-button {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
    }

    .add-button:hover {
      transform: scale(1.05);
    }

    .add-button-normal {
      background: rgba(139, 116, 79, 0.15);
      color: #8b744f;
      border: 1px solid rgba(139, 116, 79, 0.3);
    }

    .add-button-normal:hover {
      background: rgba(139, 116, 79, 0.25);
      border-color: rgba(139, 116, 79, 0.5);
    }

    .add-button-added {
      background: #4a5d23;
      color: #c9f531;
      border: 1px solid rgba(201, 245, 49, 0.3);
      animation: pulse 1s ease-in-out;
    }

    .cart-popup {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      max-width: 500px;
      background: #1a1a1a;
      border: 1px solid rgba(139, 116, 79, 0.2);
      border-bottom: none;
      border-radius: 20px 20px 0 0;
      transition: transform 0.5s ease;
      z-index: 50;
    }

    .cart-popup.show {
      transform: translateY(0);
    }

    .cart-popup.hide {
      transform: translateY(100%);
    }

    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      border-bottom: 1px solid rgba(139, 116, 79, 0.15);
      background: #262626;
      border-radius: 20px 20px 0 0;
    }

    .cart-title {
      font-weight: bold;
      font-size: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    .cart-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #8b744f, #a67c52);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .cart-title-text {
      color: #f5f5f5;
    }

    .close-button {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
      font-size: 22px;
    }

    .close-button:hover {
      color: #f5f5f5;
      background: rgba(255, 255, 255, 0.1);
    }

    .cart-items {
      max-height: 400px;
      overflow-y: auto;
    }

    .empty-cart {
      padding: 48px 24px;
      text-align: center;
    }

    .empty-cart-icon {
      width: 80px;
      height: 80px;
      background: rgba(139, 116, 79, 0.1);
      border-radius: 50%;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8b744f;
      font-size: 40px;
    }

    .empty-cart h4 {
      font-size: 20px;
      font-weight: 600;
      color: #ccc;
      margin: 0 0 8px 0;
    }

    .empty-cart p {
      color: #888;
      margin: 4px 0;
    }

    .empty-cart .highlight {
      color: #8b744f;
      font-size: 14px;
      margin-top: 8px;
    }

    .cart-item {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid rgba(139, 116, 79, 0.08);
      transition: background-color 0.3s ease;
      background: transparent;
    }

    .cart-item:hover {
      background: rgba(139, 116, 79, 0.1);
    }

    .cart-item-image-container {
      position: relative;
    }

    .cart-item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 15px;
    }

    .cart-item-quantity-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      background: #8b744f;
      color: white;
      font-size: 12px;
      font-weight: bold;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cart-item-info {
      flex: 1;
      min-width: 0;
    }

    .cart-item-name {
      font-weight: 600;
      color: #f5f5f5;
      font-size: 16px;
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cart-item-price {
      font-size: 18px;
      font-weight: bold;
      color: #8b744f;
      margin: 0;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .quantity-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(139, 116, 79, 0.3);
      color: #8b744f;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      background: rgba(139, 116, 79, 0.1);
    }

    .quantity-button:hover {
      transform: scale(1.1);
      background: rgba(139, 116, 79, 0.2);
      border-color: rgba(139, 116, 79, 0.5);
    }

    .quantity-button.minus {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }

    .quantity-button.minus:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
    }

    .quantity-button.plus {
      background: rgba(139, 116, 79, 0.1);
      color: #8b744f;
      border-color: rgba(139, 116, 79, 0.3);
    }

    .quantity-display {
      width: 40px;
      text-align: center;
      font-weight: bold;
      font-size: 18px;
      color: #f5f5f5;
    }

    .remove-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
      margin-left: 8px;
      font-size: 18px;
    }

    .remove-button:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .cart-footer {
      border-top: 1px solid rgba(139, 116, 79, 0.15);
      padding: 24px;
      background: #262626;
    }

    .total-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .total-label {
      font-size: 20px;
      font-weight: 600;
      color: #ccc;
    }

    .total-price {
      font-size: 36px;
      font-weight: bold;
      color: #8b744f;
    }

    .checkout-button {
      width: 100%;
      background: #8b744f;
      color: white;
      font-weight: bold;
      font-size: 18px;
      padding: 16px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .checkout-button:hover {
      background: #9d8359;
      transform: scale(1.02);
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 40;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 48px;
      }
      
      .hero-subtitle {
        font-size: 18px;
      }
      
      .products-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      
      .cart-popup {
        width: 100%;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="main-container">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">ツ</div>
              <div>
                <h1 className="logo-text">PHAMIE</h1>
              </div>
            </div>
            <button
              onClick={() => setShowCartPopup(!showCartPopup)}
              className="cart-button"
            >
              🛒
              {getTotalItems() > 0 && (
                <span className="cart-counter">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="main-content">
          

          {/* Product Grid */}
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-overlay"></div>
                  <div className="product-category">
                    {product.category}
                  </div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  
                  <div className="product-footer">
                    <div className="product-price">
                      Rp{product.price.toLocaleString("id-ID")}
                    </div>
                    
                    <button
                      onClick={() => addToCart(product)}
                      className={`add-button ${
                        justAdded === product._id ? 'add-button-added' : 'add-button-normal'
                      }`}
                    >
                      {justAdded === product._id ? '✨ Ditambahkan!' : '🛒 Tambah'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Popup */}
        <div className={`cart-popup ${showCartPopup ? 'show' : 'hide'}`}>
          <div className="cart-header">
            <h3 className="cart-title">
              <div className="cart-icon">🛍️</div>
              <span className="cart-title-text">
                Keranjang ({getTotalItems()})
              </span>
            </h3>
            <button
              onClick={() => setShowCartPopup(false)}
              className="close-button"
            >
              ✕
            </button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h4>Keranjang Kosong</h4>
                <p>Belum ada produk yang dipilih</p>
                <p className="highlight">Yuk, mulai berbelanja sekarang! ✨</p>
              </div>
            ) : (
              <>
                {cart.map((item, index) => (
                  <div key={`${item._id}-${index}`} className="cart-item">
                    <div className="cart-item-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-image"
                      />
                      <div className="cart-item-quantity-badge">
                        {item.quantity}
                      </div>
                    </div>
                    
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">
                        Rp{item.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="quantity-button minus"
                      >
                        −
                      </button>
                      
                      <span className="quantity-display">{item.quantity}</span>
                      
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="quantity-button plus"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="remove-button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="total-section">
                <span className="total-label">Total Pembayaran:</span>
                <span className="total-price">
                  Rp{getTotalPrice().toLocaleString("id-ID")}
                </span>
              </div>
              
              <button className="checkout-button" onClick={handleCheckout}>
                🚀 Checkout Sekarang ({getTotalItems()} item)
                </button>

            </div>
          )}
        </div>

        {/* Overlay */}
        {showCartPopup && (
          <div 
            className="overlay"
            onClick={() => setShowCartPopup(false)}
          />
        )}
      </div>
    </>
  );
}