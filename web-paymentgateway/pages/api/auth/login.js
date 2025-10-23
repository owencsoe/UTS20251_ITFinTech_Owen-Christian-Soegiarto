import connectDB from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // ✅ Verifikasi password (bisa hash / polos)
    const isValidPassword =
      user.password === password || (await bcrypt.compare(password, user.password));

    if (!isValidPassword) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // ✅ CEK APAKAH ADMIN - SKIP OTP
    if (user.role === "admin") {
      // Generate JWT token untuk admin
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET || "your-secret-key-change-this",
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        skipOTP: true,
        role: "admin",
        token,
        name: user.name,
        email: user.email,
        message: "Login admin berhasil"
      });
    }

    // ✅ USER BIASA - Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // ✅ Kirim OTP via WhatsApp pakai Fonnte
    await sendWhatsAppOTP(user.phone, otp, user.name);

    return res.status(200).json({
      success: true,
      userId: user._id,
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

  try {
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

    return await response.json();
  } catch (error) {
    console.error("Fonnte error:", error);
    throw error;
  }
}