import connectDB from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password diperlukan" });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Verifikasi password (bisa hash / polos)
    const isValidPassword =
      user.password === password || (await bcrypt.compare(password, user.password));

    if (!isValidPassword) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // --- Seluruh user (termasuk admin) harus pakai OTP ---
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Kirim OTP via WhatsApp pakai Fonnte
    try {
      await sendWhatsAppOTP(user.phone, otp, user.name);
    } catch (sendErr) {
      console.error("Gagal mengirim OTP:", sendErr);
      // tetap return success tetapi beri tahu bahwa pengiriman gagal
      return res.status(500).json({
        success: false,
        message: "Gagal mengirim OTP — coba lagi nanti",
      });
    }

    // Jangan keluarkan token di sini — token hanya dikeluarkan setelah OTP terverifikasi
    return res.status(200).json({
      success: true,
      userId: user._id,
      role: user.role,
      phone: user.phone,
      message: "OTP telah dikirim ke WhatsApp Anda",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}

// ------------------------------------------------------------
// 🔹 Fungsi kirim WhatsApp OTP via Fonnte API
// ------------------------------------------------------------
async function sendWhatsAppOTP(phone, otp, name) {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  const message = `Halo ${name}! 👋\n\n` +
    `Kode OTP Anda untuk login ke PHAMIE:\n\n` +
    `*${otp}*\n\n` +
    `Kode berlaku selama 10 menit.\n` +
    `Jangan bagikan kode ini kepada siapapun! 🔒`;

  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: FONNTE_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: phone,
      message,
      countryCode: "62",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Fonnte error: ${JSON.stringify(data)}`);
  }
  return data;
}
