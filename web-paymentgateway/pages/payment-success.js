import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Trigger animations on mount
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setShowConfetti(true), 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleBackToHome = () => {
    router.push('/');
  };

  const styles = `
    .payment-success {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      position: relative;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Animated background elements */
    .bg-decoration {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .bg-decoration-1 {
      top: 80px;
      left: 80px;
      width: 128px;
      height: 128px;
      background: #ca8a04;
      animation: pulse 2s infinite;
    }

    .bg-decoration-2 {
      top: 160px;
      right: 128px;
      width: 96px;
      height: 96px;
      background: #f59e0b;
      opacity: 0.15;
      animation: bounce 2s infinite;
    }

    .bg-decoration-3 {
      bottom: 128px;
      left: 25%;
      width: 64px;
      height: 64px;
      background: #eab308;
      animation: ping 2s infinite;
    }

    .bg-decoration-4 {
      bottom: 80px;
      right: 80px;
      width: 80px;
      height: 80px;
      background: #d97706;
      animation: pulse 3s infinite;
    }

    /* Confetti particles */
    .confetti-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 5;
    }

    .confetti-particle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: linear-gradient(45deg, #fbbf24, #f59e0b);
      border-radius: 2px;
      animation: confetti-fall 3s infinite;
    }

    /* Main container */
    .success-container {
      position: relative;
      z-index: 10;
      max-width: 448px;
      width: 100%;
      transform: translateY(32px);
      opacity: 0;
      transition: all 0.7s ease-out;
    }

    .success-container.visible {
      transform: translateY(0);
      opacity: 1;
    }

    /* Success card */
    .success-card {
      background: rgba(31, 41, 55, 0.9);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      padding: 32px;
      text-align: center;
      border: 1px solid rgba(55, 65, 81, 0.5);
      margin-bottom: 16px;
    }

    /* Success icon */
    .success-icon-container {
      position: relative;
      margin: 0 auto 24px;
      width: 80px;
      height: 80px;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(202, 138, 4, 0.3);
      transition: transform 0.5s ease;
      position: relative;
      z-index: 2;
    }

    .success-icon:hover {
      transform: scale(1.1);
    }

    .checkmark {
      width: 40px;
      height: 40px;
      color: white;
      font-size: 32px;
      font-weight: bold;
      animation: pulse 2s infinite;
    }

    .ripple-effect {
      position: absolute;
      inset: 0;
      width: 80px;
      height: 80px;
      background: #eab308;
      border-radius: 50%;
      animation: ping 2s infinite;
      opacity: 0.2;
      z-index: 1;
    }

    /* Typography */
    .success-title {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .success-message {
      color: #d1d5db;
      margin-bottom: 8px;
      line-height: 1.6;
      font-size: 16px;
    }

    .success-submessage {
      color: #9ca3af;
      font-size: 14px;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    /* Buttons */
    .button-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }

    .btn-primary {
      width: 100%;
      background: linear-gradient(135deg, #ca8a04, #d97706);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(202, 138, 4, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 25px rgba(202, 138, 4, 0.4);
      background: linear-gradient(135deg, #b45309, #ea580c);
    }

    .btn-secondary {
      width: 100%;
      background: rgba(55, 65, 81, 0.5);
      color: #d1d5db;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      border: 1px solid rgba(75, 85, 99, 0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      transform: translateY(-2px) scale(1.02);
      background: rgba(75, 85, 99, 0.5);
      border-color: rgba(107, 114, 128, 0.5);
    }

    .icon {
      width: 20px;
      height: 20px;
      font-size: 16px;
    }

    .arrow-icon {
      transition: transform 0.2s ease;
    }

    .btn-primary:hover .arrow-icon,
    .btn-secondary:hover .arrow-icon {
      transform: translateX(4px);
    }

    /* Info section */
    .info-section {
      padding-top: 24px;
      border-top: 1px solid rgba(55, 65, 81, 0.5);
    }

    .info-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      font-size: 14px;
      color: #9ca3af;
    }

    .info-badge {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-green { background: #10b981; }
    .status-yellow { background: #eab308; }

    /* Order details */
    .order-details {
      background: rgba(31, 41, 55, 0.5);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(55, 65, 81, 0.3);
      text-align: center;
      transform: translateY(16px);
      opacity: 0;
      transition: all 0.7s ease-out 0.3s;
    }

    .order-details.visible {
      transform: translateY(0);
      opacity: 1;
    }

    .order-label {
      color: #9ca3af;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .order-number {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 18px;
      font-weight: 600;
      color: #fbbf24;
    }

    /* Floating particles */
    .floating-particles {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: #fbbf24;
      border-radius: 50%;
      opacity: 0.4;
      animation: float-particle 4s ease-in-out infinite;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes ping {
      0% { transform: scale(1); opacity: 1; }
      75%, 100% { transform: scale(2); opacity: 0; }
    }

    @keyframes confetti-fall {
      0% { 
        transform: translateY(-100vh) rotateZ(0deg); 
        opacity: 1; 
      }
      100% { 
        transform: translateY(100vh) rotateZ(720deg); 
        opacity: 0; 
      }
    }

    @keyframes float-particle {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
        opacity: 0.4; 
      }
      50% { 
        transform: translateY(-20px) rotate(180deg); 
        opacity: 0.8; 
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .payment-success {
        padding: 12px;
      }
      
      .success-card {
        padding: 24px 20px;
      }
      
      .success-title {
        font-size: 24px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="payment-success">
        {/* Background decorations */}
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>
        <div className="bg-decoration bg-decoration-3"></div>
        <div className="bg-decoration bg-decoration-4"></div>

        {/* Confetti effect */}
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="confetti-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        <div className={`success-container ${isVisible ? 'visible' : ''}`}>
          {/* Main success card */}
          <div className="success-card">
            {/* Success icon with animation */}
            <div className="success-icon-container">
              <div className="success-icon">
                <div className="checkmark">✓</div>
              </div>
              <div className="ripple-effect"></div>
            </div>

            {/* Success message */}
            <h1 className="success-title">
              Pembayaran Berhasil!
            </h1>
            
            <p className="success-message">
              Terima kasih! Pesanan Anda telah berhasil diproses.
            </p>
            
            {/* Action buttons */}
            <div className="button-group">
              <button 
                className="btn-secondary"
                onClick={handleBackToHome}
              >
                <span className="icon"></span>
                Kembali ke Beranda
                <span className="arrow-icon"></span>
              </button>
            </div>
          </div>

          {/* Order details preview */}
        </div>

        {/* Floating particles */}
        <div className="floating-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}