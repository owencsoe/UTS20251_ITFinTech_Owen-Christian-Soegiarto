// scripts/setupAdmin.js
// Jalankan dengan: node scripts/setupAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// SESUAIKAN dengan MongoDB URI Anda
const MONGODB_URI = 'mongodb+srv://owen:owen1@cluster0.rhrercu.mongodb.net/paymentgateway?retryWrites=true&w=majority&appName=Cluster0';

// Schema User (pastikan sama dengan model di aplikasi)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function setupAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Data admin - SESUAIKAN DENGAN DATA ANDA
    const adminEmail = 'admin@phamie.com';
    const adminPassword = 'admin123';
    const adminPhone = '6281807973333'; // ⚠️ PENTING: Nomor ini akan terima OTP!
    const adminName = 'Admin Phamie';

    // Cek apakah admin sudah ada
    console.log('🔍 Checking existing admin...');
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️  Admin sudah ada di database!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('👤 Role:', existingAdmin.role);
      console.log('📱 Phone:', existingAdmin.phone);
      console.log('✓ Verified:', existingAdmin.isVerified);
      
      console.log('\n🔄 Updating admin password, phone, dan role...');
      
      // Hash password baru
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Update admin
      existingAdmin.name = adminName;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin'; // Pastikan role admin
      existingAdmin.phone = adminPhone; // Update phone
      existingAdmin.isVerified = true; // Pastikan verified
      existingAdmin.otp = undefined; // Hapus OTP lama
      existingAdmin.otpExpiry = undefined;
      
      await existingAdmin.save();
      console.log('✅ Admin berhasil diupdate!');
      
    } else {
      console.log('📝 Creating new admin...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Buat admin baru
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: 'admin',
        isVerified: true, // Admin langsung verified
      });

      console.log('✅ Admin berhasil dibuat!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.name);
      console.log('👤 Role:', admin.role);
      console.log('📱 Phone:', admin.phone);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 KREDENSIAL LOGIN ADMIN:');
    console.log('='.repeat(60));
    console.log('Email    :', adminEmail);
    console.log('Password :', adminPassword);
    console.log('WhatsApp :', adminPhone);
    console.log('='.repeat(60));
    
    console.log('\n💡 Cara Login Admin:');
    console.log('1. Buka halaman login (sama dengan user biasa)');
    console.log('2. Klik tab "Login"');
    console.log('3. Masukkan email:', adminEmail);
    console.log('4. Masukkan password:', adminPassword);
    console.log('5. Kode OTP akan dikirim ke WhatsApp:', adminPhone);
    console.log('6. Masukkan kode OTP 6 digit');
    console.log('7. Setelah verifikasi → auto-redirect ke /admin/dashboard');
    
    // Test login credentials
    console.log('\n🧪 Testing credentials...');
    const testAdmin = await User.findOne({ email: adminEmail });
    const isPasswordValid = await bcrypt.compare(adminPassword, testAdmin.password);
    
    console.log('✓ Email found      :', testAdmin ? '✅ YES' : '❌ NO');
    console.log('✓ Password valid   :', isPasswordValid ? '✅ YES' : '❌ NO');
    console.log('✓ Role is admin    :', testAdmin?.role === 'admin' ? '✅ YES' : '❌ NO');
    console.log('✓ Phone exists     :', testAdmin?.phone ? `✅ ${testAdmin.phone}` : '❌ NO');
    console.log('✓ Is verified      :', testAdmin?.isVerified ? '✅ YES' : '⚠️  NO');

    // Tampilkan statistik
    console.log('\n📊 Database Statistics:');
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalRegularUsers = await User.countDocuments({ role: 'user' });
    
    console.log('Total Users      :', totalUsers);
    console.log('Total Admins     :', totalAdmins);
    console.log('Total Regular    :', totalRegularUsers);

    console.log('\n⚠️  PENTING:');
    console.log('- Pastikan nomor WhatsApp', adminPhone, 'aktif');
    console.log('- OTP akan dikirim ke nomor tersebut saat login');
    console.log('- Jika tidak menerima OTP, cek:');
    console.log('  1. API WhatsApp gateway berfungsi');
    console.log('  2. Nomor format benar (dimulai 62)');
    console.log('  3. Check logs di API /api/auth/login');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('💡 Duplicate key error. Email atau phone sudah terdaftar.');
      console.error('   Coba ganti email atau phone number.');
    } else {
      console.error('Stack:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

setupAdmin();