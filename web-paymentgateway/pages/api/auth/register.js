import connectDB from '../../../lib/mongodb';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { name, email, phone, password } = req.body;

    // Validasi input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    // Cek email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Simpan user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: email === 'admin@phamie.com' ? 'admin' : 'user',
      otp,
      otpExpiry,
      isVerified: false
    });

    // Kirim OTP via Fonnte
    await sendWhatsAppOTP(phone, otp, name);

    return res.status(201).json({
      success: true,
      userId: user._id,
      message: 'Registrasi berhasil, silakan cek WhatsApp Anda'
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
}

async function sendWhatsAppOTP(phone, otp, name) {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  
  const message = `Halo ${name}! 👋\n\n` +
    `Kode OTP Anda untuk login ke PHAMIE:\n\n` +
    `*${otp}*\n\n` +
    `Kode berlaku selama 10 menit.\n` +
    `Jangan bagikan kode ini kepada siapapun! 🔒`;

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: phone,
        message: message,
        countryCode: '62'
      })
    });

    const data = await response.json();
    console.log('Fonnte response:', data);
    return data;
  } catch (error) {
    console.error('Fonnte error:', error);
    throw error;
  }
}