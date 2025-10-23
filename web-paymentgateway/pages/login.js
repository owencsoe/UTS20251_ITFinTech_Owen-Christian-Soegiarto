import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('credentials');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);

  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        // Validasi registrasi
        if (formData.password !== formData.confirmPassword) {
          setError('Password tidak cocok');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password minimal 6 karakter');
          setLoading(false);
          return;
        }

        if (!formData.phone.startsWith('62')) {
          setError('Nomor WhatsApp harus diawali dengan 62 (contoh: 628123456789)');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          setTempUserId(data.userId);
          setSuccess(`Kode OTP telah dikirim ke WhatsApp ${formData.phone}`);
          setStep('otp');
        } else {
          setError(data.message || 'Registrasi gagal');
        }
      } else {
        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Cek apakah admin (skip OTP)
          // ...
          // Cek apakah admin (skip OTP)
          if (data.skipOTP && data.role === 'admin') {
            // Admin langsung login tanpa OTP
            sessionStorage.setItem('adminToken', data.token); // ✅ Fix: Menggunakan sessionStorage dan adminToken
            sessionStorage.setItem('adminName', data.name);   // ✅ Fix: Menggunakan sessionStorage dan adminName
            sessionStorage.setItem('userRole', data.role);    // Bisa tetap atau ganti ke adminRole
            sessionStorage.setItem('userEmail', data.email);  // Bisa tetap
            
            setSuccess('Login admin berhasil! Mengalihkan...');
            
            setTimeout(() => {
              window.location.href = '/admin/dashboard';
            }, 1000);
          } else {
            // User biasa perlu OTP
            setTempUserId(data.userId);
            setSuccess(`Kode OTP telah dikirim ke WhatsApp ${data.phone}`);
            setStep('otp');
          }
        } else {
          setError(data.message || 'Login gagal');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempUserId,
          otp: otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userRole', data.role);
        
        if (data.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(data.message || 'Kode OTP tidak valid');
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUserId })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Kode OTP baru telah dikirim');
      } else {
        setError(data.message || 'Gagal mengirim ulang OTP');
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = () => {
    window.location.href = '/';
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
          max-width: 480px;
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

        .mode-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          background: rgba(17, 24, 39, 0.5);
          padding: 6px;
          border-radius: 12px;
        }

        .mode-tab {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: none;
          color: #9ca3af;
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mode-tab.active {
          background: linear-gradient(135deg, #ca8a04, #d97706);
          color: white;
        }

        .form-group {
          margin-bottom: 20px;
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

        .error-message, .success-message {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .success-message {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        .submit-button {
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
          margin-bottom: 16px;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #b45309, #ea580c);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(202, 138, 4, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-button {
          width: 100%;
          padding: 14px;
          background: rgba(75, 85, 99, 0.3);
          color: #d1d5db;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid rgba(75, 85, 99, 0.5);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-button:hover {
          background: rgba(75, 85, 99, 0.5);
          border-color: rgba(75, 85, 99, 0.7);
        }

        .otp-container {
          text-align: center;
        }

        .otp-icon {
          width: 80px;
          height: 80px;
          background: rgba(202, 138, 4, 0.15);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
          font-size: 40px;
          margin-bottom: 24px;
        }

        .otp-title {
          font-size: 24px;
          font-weight: 700;
          color: #f9fafb;
          margin-bottom: 12px;
        }

        .otp-description {
          color: #9ca3af;
          font-size: 14px;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .otp-input-group {
          margin-bottom: 24px;
        }

        .otp-input {
          width: 100%;
          padding: 16px;
          background: rgba(17, 24, 39, 0.8);
          border: 2px solid rgba(251, 191, 36, 0.3);
          border-radius: 12px;
          color: #f9fafb;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          letter-spacing: 8px;
          transition: all 0.3s ease;
        }

        .otp-input:focus {
          outline: none;
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }

        .resend-link {
          color: #fbbf24;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .resend-link:hover {
          color: #f59e0b;
        }

        .back-link {
          text-align: center;
          margin-top: 16px;
        }

        .back-link button {
          background: none;
          border: none;
          color: #fbbf24;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .back-link button:hover {
          color: #f59e0b;
        }

        .info-box {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }

        .info-box p {
          color: #93c5fd;
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
        }

        .admin-hint {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }

        .admin-hint p {
          color: #c4b5fd;
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
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
            <p className="logo-subtitle">
              {step === 'credentials' ? 'Masuk atau Daftar Akun' : 'Verifikasi WhatsApp'}
            </p>
          </div>

          {step === 'credentials' ? (
            <>
              <div className="mode-tabs">
                <button
                  className={`mode-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                >
                  Login
                </button>
                <button
                  className={`mode-tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                >
                  Daftar
                </button>
              </div>

              {mode === 'login' && (
                <div className="admin-hint">
                  <p>👑 Admin akan langsung masuk tanpa OTP</p>
                </div>
              )}

              {mode === 'register' && (
                <div className="info-box">
                  <p>💡 Nomor WhatsApp harus diawali dengan kode negara 62 (contoh: 628123456789)</p>
                </div>
              )}

              <form onSubmit={handleSubmitCredentials}>
                {error && (
                  <div className="error-message">
                    ⚠ {error}
                  </div>
                )}

                {success && (
                  <div className="success-message">
                    ✓ {success}
                  </div>
                )}

                {mode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                {mode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="628123456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>

                {mode === 'register' && (
                  <div className="form-group">
                    <label className="form-label">Konfirmasi Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? '⏳ Memproses...' : mode === 'register' ? '🚀 Daftar' : '🔓 Login'}
                </button>

                <button 
                  type="button"
                  className="secondary-button"
                  onClick={handleSkipLogin}
                >
                  Lanjut Tanpa Login
                </button>
              </form>
            </>
          ) : (
            <div className="otp-container">
              <div className="otp-icon">📱</div>
              <h2 className="otp-title">Masukkan Kode OTP</h2>
              <p className="otp-description">
                Kami telah mengirimkan kode verifikasi 6 digit ke nomor WhatsApp Anda
              </p>

              <form onSubmit={handleVerifyOtp}>
                {error && (
                  <div className="error-message">
                    ⚠ {error}
                  </div>
                )}

                {success && (
                  <div className="success-message">
                    ✓ {success}
                  </div>
                )}

                <div className="otp-input-group">
                  <input
                    type="text"
                    className="otp-input"
                    placeholder="000000"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? '⏳ Memverifikasi...' : '✓ Verifikasi'}
                </button>

                <p style={{textAlign: 'center', color: '#9ca3af', fontSize: '14px', marginBottom: '12px'}}>
                  Tidak menerima kode?{' '}
                  <a onClick={handleResendOtp} className="resend-link">
                    Kirim Ulang
                  </a>
                </p>

                <div className="back-link">
                  <button type="button" onClick={() => {setStep('credentials'); setOtp(''); setError(''); setSuccess('');}}>
                    ← Kembali
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}