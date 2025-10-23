import { useState, useEffect } from "react";
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
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userName) {
      setUser({ name: userName, role: userRole, token });
    }
  }, []);

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

  // Logout function
  const handleLogout = () => {
    if (confirm('Yakin ingin logout?')) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      setUser(null);
      router.reload();
    }
  };

  // handleCheckout dengan auth check
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Check if user logged in
    if (!user) {
      if (confirm('Anda perlu login untuk checkout. Login sekarang?')) {
        router.push("/login");
      }
      return;
    }
    
    router.push("/checkout");
  };

  const styles = `
    .homepage {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%);
      color: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      overflow-x: hidden;
    }

    /* Background decorations */
    .bg-decoration {
      position: absolute;
      border-radius: 50%;
      opacity: 0.03;
      pointer-events: none;
      z-index: 1;
    }

    .bg-decoration-1 {
      top: 10%;
      left: 10%;
      width: 200px;
      height: 200px;
      background: #ca8a04;
      animation: float 6s ease-in-out infinite;
    }

    .bg-decoration-2 {
      top: 60%;
      right: 15%;
      width: 150px;
      height: 150px;
      background: #f59e0b;
      animation: float 8s ease-in-out infinite reverse;
    }

    .bg-decoration-3 {
      bottom: 20%;
      left: 20%;
      width: 120px;
      height: 120px;
      background: #eab308;
      animation: float 7s ease-in-out infinite;
    }

    /* Header */
    .header {
      background: rgba(31, 41, 55, 0.8);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(251, 191, 36, 0.1);
      position: sticky;
      top: 0;
      z-index: 50;
      transition: all 0.3s ease;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
      opacity: 0;
      transform: translateX(-20px);
      animation: slideInLeft 0.8s ease-out 0.2s forwards;
    }

    .logo-icon {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      font-weight: bold;
      box-shadow: 0 8px 25px rgba(202, 138, 4, 0.3);
      transition: transform 0.3s ease;
    }

    .logo-icon:hover {
      transform: scale(1.05) rotate(5deg);
    }

    .logo-text {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: -0.5px;
    }

    /* Header Right Section */
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: rgba(202, 138, 4, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.2);
      border-radius: 12px;
      opacity: 0;
      transform: translateX(20px);
      animation: slideInRight 0.8s ease-out 0.3s forwards;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      color: #f9fafb;
      font-weight: 600;
      font-size: 14px;
      margin: 0;
      line-height: 1.2;
    }

    .user-role {
      color: #fbbf24;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      margin: 0;
      line-height: 1;
    }

    .auth-button {
      padding: 10px 20px;
      background: rgba(202, 138, 4, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.2);
      color: #fbbf24;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(20px);
      animation: slideInRight 0.8s ease-out 0.35s forwards;
    }

    .auth-button:hover {
      background: rgba(202, 138, 4, 0.2);
      border-color: rgba(251, 191, 36, 0.4);
      transform: scale(1.05);
    }

    .logout-button {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .logout-button:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
    }

    .cart-button {
      position: relative;
      padding: 16px;
      background: rgba(202, 138, 4, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.2);
      color: #fbbf24;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 24px;
      opacity: 0;
      transform: translateX(20px);
      animation: slideInRight 0.8s ease-out 0.4s forwards;
    }

    .cart-button:hover {
      background: rgba(202, 138, 4, 0.2);
      border-color: rgba(251, 191, 36, 0.4);
      transform: scale(1.05);
    }

    .cart-counter {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      color: white;
      font-size: 12px;
      font-weight: bold;
      min-width: 24px;
      height: 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      animation: bounceIn 0.5s ease-out;
      box-shadow: 0 2px 8px rgba(202, 138, 4, 0.4);
    }

    /* Hero section */
    .hero-section {
      text-align: center;
      padding: 80px 24px 60px;
      position: relative;
      z-index: 10;
    }

    .hero-title {
      font-size: 72px;
      font-weight: 800;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 24px 0;
      line-height: 1.1;
      opacity: 0;
      transform: translateY(30px);
      animation: fadeInUp 1s ease-out 0.6s forwards;
    }

    .hero-subtitle {
      font-size: 20px;
      color: #d1d5db;
      max-width: 600px;
      margin: 0 auto 40px;
      line-height: 1.6;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 1s ease-out 0.8s forwards;
    }

    /* Products grid */
    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px 80px;
      position: relative;
      z-index: 10;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 32px;
    }

    .product-card {
      background: rgba(31, 41, 55, 0.6);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(251, 191, 36, 0.1);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      opacity: 0;
      transform: translateY(30px);
      animation: fadeInUp 0.8s ease-out forwards;
    }

    .product-card:nth-child(1) { animation-delay: 1s; }
    .product-card:nth-child(2) { animation-delay: 1.1s; }
    .product-card:nth-child(3) { animation-delay: 1.2s; }
    .product-card:nth-child(4) { animation-delay: 1.3s; }
    .product-card:nth-child(5) { animation-delay: 1.4s; }
    .product-card:nth-child(6) { animation-delay: 1.5s; }

    .product-card:hover {
      transform: translateY(-12px) scale(1.02);
      border-color: rgba(251, 191, 36, 0.3);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(251, 191, 36, 0.1);
    }

    .product-image-container {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.2);
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-card:hover .product-image {
      transform: scale(1.1);
    }

    .product-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 60%);
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
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      color: #fbbf24;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid rgba(251, 191, 36, 0.3);
      text-transform: capitalize;
    }

    .product-info {
      padding: 24px;
      background: rgba(17, 24, 39, 0.8);
    }

    .product-name {
      font-weight: 600;
      font-size: 22px;
      color: #f9fafb;
      margin: 0 0 16px 0;
      line-height: 1.3;
      transition: color 0.3s ease;
    }

    .product-card:hover .product-name {
      color: #fbbf24;
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .product-price {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .add-button {
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .add-button-normal {
      background: rgba(202, 138, 4, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .add-button-normal:hover {
      background: rgba(202, 138, 4, 0.25);
      border-color: rgba(251, 191, 36, 0.5);
      transform: scale(1.05);
    }

    .add-button-added {
      background: linear-gradient(135deg, #16a34a, #15803d);
      color: white;
      border: 1px solid rgba(34, 197, 94, 0.3);
      animation: successPulse 0.6s ease-out;
    }

    /* Cart popup */
    .cart-popup {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      max-width: 480px;
      background: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(251, 191, 36, 0.2);
      border-bottom: none;
      border-radius: 20px 20px 0 0;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
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
      border-bottom: 1px solid rgba(251, 191, 36, 0.1);
      background: rgba(31, 41, 55, 0.8);
      border-radius: 20px 20px 0 0;
    }

    .cart-title {
      font-weight: 700;
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    .cart-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
    }

    .cart-title-text {
      color: #f9fafb;
    }

    .close-button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-size: 18px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      color: #f9fafb;
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    .cart-items {
      flex: 1;
      overflow-y: auto;
      max-height: 400px;
    }

    .empty-cart {
      padding: 60px 24px;
      text-align: center;
    }

    .empty-cart-icon {
      width: 80px;
      height: 80px;
      background: rgba(202, 138, 4, 0.1);
      border-radius: 50%;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fbbf24;
      font-size: 32px;
    }

    .empty-cart h4 {
      font-size: 18px;
      font-weight: 600;
      color: #e5e7eb;
      margin: 0 0 8px 0;
    }

    .empty-cart p {
      color: #9ca3af;
      margin: 4px 0;
      font-size: 14px;
    }

    .empty-cart .highlight {
      color: #fbbf24;
      font-size: 14px;
      margin-top: 12px;
      font-weight: 500;
    }

    .cart-item {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid rgba(251, 191, 36, 0.08);
      transition: background-color 0.3s ease;
      background: transparent;
    }

    .cart-item:hover {
      background: rgba(202, 138, 4, 0.05);
    }

    .cart-item-image-container {
      position: relative;
      flex-shrink: 0;
    }

    .cart-item-image {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 12px;
    }

    .cart-item-quantity-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      color: white;
      font-size: 11px;
      font-weight: bold;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(17, 24, 39, 1);
    }

    .cart-item-info {
      flex: 1;
      min-width: 0;
    }

    .cart-item-name {
      font-weight: 600;
      color: #f9fafb;
      font-size: 15px;
      margin: 0 0 4px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cart-item-price {
      font-size: 16px;
      font-weight: 600;
      color: #fbbf24;
      margin: 0;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(55, 65, 81, 0.5);
      border-radius: 8px;
      padding: 2px;
    }

    .quantity-button {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      font-weight: bold;
    }

    .quantity-button:hover {
      transform: scale(1.1);
    }

    .quantity-button.minus {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .quantity-button.minus:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .quantity-button.plus {
      background: rgba(202, 138, 4, 0.2);
      color: #fbbf24;
    }

    .quantity-button.plus:hover {
      background: rgba(202, 138, 4, 0.3);
    }

    .quantity-display {
      min-width: 24px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      color: #f9fafb;
    }

    .remove-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.3s ease;
      margin-left: 4px;
      font-size: 16px;
    }

    .remove-button:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      transform: scale(1.1);
    }

    .cart-footer {
      border-top: 1px solid rgba(251, 191, 36, 0.1);
      padding: 24px;
      background: rgba(31, 41, 55, 0.9);
    }

    .total-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .total-label {
      font-size: 16px;
      font-weight: 600;
      color: #e5e7eb;
    }

    .total-price {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .checkout-button {
      width: 100%;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      color: white;
      font-weight: 700;
      font-size: 16px;
      padding: 16px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .checkout-button:hover {
      background: linear-gradient(135deg, #b45309, #ea580c);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(202, 138, 4, 0.3);
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 90;
      opacity: 0;
      animation: fadeIn 0.3s ease-out forwards;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .products-grid {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
      }
      
      .header-right {
        gap: 10px;
      }
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 48px;
      }
      
      .hero-subtitle {
        font-size: 18px;
        padding: 0 16px;
      }
      
      .products-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .cart-popup {
        width: 100%;
        max-width: 100%;
        border-radius: 16px 16px 0 0;
      }

      .product-card {
        margin: 0 8px;
      }

      .header-content {
        padding: 16px 20px;
      }

      .logo-text {
        font-size: 24px;
      }
      
      .logo-icon {
        width: 44px;
        height: 44px;
        font-size: 24px;
      }

      .header-right {
        gap: 8px;
      }

      .user-info {
        padding: 8px 12px;
      }
      
      .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      .user-name {
        font-size: 13px;
      }
      
      .user-role {
        font-size: 10px;
      }

      .auth-button {
        padding: 8px 14px;
        font-size: 13px;
      }
      
      .cart-button {
        padding: 12px;
        font-size: 20px;
      }
    }
    
    @media (max-width: 480px) {
      .header-content {
        gap: 8px;
      }
      
      .logo-section {
        gap: 8px;
      }
      
      .logo-text {
        font-size: 20px;
      }
      
      .user-details {
        display: none;
      }
      
      .user-info {
        padding: 8px;
      }
      
      .auth-button {
        padding: 8px 12px;
        font-size: 12px;
      }
    }

    /* Animations */
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    @keyframes slideInLeft {
      0% {
        opacity: 0;
        transform: translateX(-30px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInRight {
      0% {
        opacity: 0;
        transform: translateX(30px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(30px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes successPulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      }
      70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="homepage">
        {/* Background decorations */}
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>
        <div className="bg-decoration bg-decoration-3"></div>

        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">ツ</div>
              <div>
                <h1 className="logo-text">PHAMIE</h1>
              </div>
            </div>
            
            <div className="header-right">
              {user ? (
                <>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <p className="user-name">{user.name}</p>
                      <p className="user-role">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="auth-button logout-button"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="auth-button"
                >
                  🔐 Login
                </button>
              )}
              
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
        </div>

        {/* Hero section */}

          <p className="hero-subtitle">
          </p>

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