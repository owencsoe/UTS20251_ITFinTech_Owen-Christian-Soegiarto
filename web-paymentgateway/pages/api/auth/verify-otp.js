import connectDB from '../../../lib/mongodb';
import User from '../../../models/user';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ message: 'userId dan otp wajib diisi' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Pastikan user punya OTP aktif
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'Tidak ada OTP aktif, silakan login ulang' });
    }

    // Cek OTP expired
    const now = new Date();
    if (now > user.otpExpiry) {
      return res.status(400).json({ message: 'Kode OTP salah atau sudah kadaluarsa' });
    }

    // Jika OTP disimpan plaintext:
    const isOtpValid = user.otp === otp;

    // (Opsional keamanan ekstra: jika kamu nanti menyimpan OTP dalam bentuk hash)
    // const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    // const isOtpValid = user.otp === otpHash;

    if (!isOtpValid) {
      return res.status(400).json({ message: 'Kode OTP salah atau sudah kadaluarsa' });
    }

    // Bersihkan OTP dan tandai verifikasi
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // 🚨 pastikan JWT_SECRET sudah diset di environment
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      name: user.name,
      role: user.role,
      message: `Verifikasi berhasil. Selamat datang, ${user.role === 'admin' ? 'Admin' : user.name}!`,
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}
