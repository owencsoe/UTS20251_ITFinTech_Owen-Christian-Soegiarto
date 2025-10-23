import connectDB from '../../../lib/mongodb';
import User from '../../../models/user';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Generate OTP baru
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Kirim OTP via Fonnte
    await sendWhatsAppOTP(user.phone, otp, user.name);

    return res.status(200).json({
      success: true,
      message: 'OTP baru telah dikirim'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
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

    return await response.json();
  } catch (error) {
    console.error('Fonnte error:', error);
    throw error;
  }
}