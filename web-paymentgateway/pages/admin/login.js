import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan token ke session storage
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminName', data.name);
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .bg-decoration {
          position: absolute;
          border-radius: 50%;
          opacity: 0.03;
          pointer-events: none;
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
          bottom: 10%;
          right: 10%;
          width: 150px;
          height: 150px;
          background: #f59e0b;
          animation: float 8s ease-in-out infinite reverse;
        }

        .login-card {
          background: rgba(31, 41, 55, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          position: relative;
          z-index: 10;
          animation: fadeInUp 0.8s ease-out;
        }

        .logo-section {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ca8a04, #d97706);
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 40px;
          font-weight: bold;
          box-shadow: 0 8px 25px rgba(202, 138, 4, 0.3);
          margin-bottom: 20px;
        }

        .logo-text {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .logo-subtitle {
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          color: #e5e7eb;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 12px;
          color: #f9fafb;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(251, 191, 36, 0.5);
          background: rgba(17, 24, 39, 0.95);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .form-input::placeholder {
          color: #6b7280;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #ca8a04, #d97706);
          color: white;
          font-weight: 700;
          font-size: 16px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #b45309, #ea580c);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(202, 138, 4, 0.3);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-link {
          text-align: center;
          margin-top: 24px;
        }

        .back-link a {
          color: #fbbf24;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .back-link a:hover {
          color: #f59e0b;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
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

        @media (max-width: 768px) {
          .login-card {
            padding: 32px 24px;
          }
          
          .logo-text {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>

        <div className="login-card">
          <div className="logo-section">
            <div className="logo-icon">🔐</div>
            <h1 className="logo-text">PHAMIE</h1>
            <p className="logo-subtitle">Admin Dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <div className="error-message">
                ⚠ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@phamie.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? '⏳ Memproses...' : '🚀 Login'}
            </button>
          </form>

          <div className="back-link">
            <a href="/">← Kembali ke Toko</a>
          </div>
        </div>
      </div>
    </>
  );
}