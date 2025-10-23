import connectDB from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email }); // Debug log

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password harus diisi" });
    }

    // Cari user berdasarkan email (case insensitive)
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    console.log('👤 User found:', user ? { 
      email: user.email, 
      role: user.role,
      hasPassword: !!user.password,
      isVerified: user.isVerified 
    } : 'NOT FOUND'); // Debug log

    if (!user) {
      console.log('❌ User not found'); // Debug log
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Password valid:', isPasswordValid); // Debug log

    if (!isPasswordValid) {
      console.log('❌ Invalid password'); // Debug log
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // UNTUK ADMIN: Langsung login tanpa OTP
    if (user.role === 'admin') {
      console.log('👑 Admin login - skipping OTP'); // Debug log
      
      // Generate token sederhana (atau bisa pakai JWT)
      const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');
      
      return res.status(200).json({
        message: "Login admin berhasil",
        token,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skipOTP: true, // Flag untuk skip OTP di frontend
      });
    }

    // UNTUK USER BIASA: Kirim OTP ke WhatsApp
    console.log('📱 Generating OTP for user'); // Debug log
    
    // Generate OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // Simpan OTP ke database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // TODO: Kirim OTP ke WhatsApp menggunakan API Fonnte
    // Untuk development, tampilkan OTP di console
    console.log('🔢 OTP for', user.phone, ':', otp);

    return res.status(200).json({
      message: "OTP telah dikirim ke WhatsApp",
      userId: user._id,
      phone: user.phone,
      // Untuk development, uncomment line dibawah
      // devOTP: otp, // HAPUS INI DI PRODUCTION!
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ 
      message: "Terjadi kesalahan server",
      error: error.message 
    });
  }
}