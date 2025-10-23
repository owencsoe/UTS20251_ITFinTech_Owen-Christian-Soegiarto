// Script untuk setup admin - jalankan dengan: node scripts/setupAdmin.js
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

    // Data admin
    const adminEmail = 'admin@phamie.com';
    const adminPassword = 'admin123';
    const adminPhone = '6281807973333'; // Sesuaikan dengan nomor WA yang valid

    // Cek apakah admin sudah ada
    console.log('🔍 Checking existing admin...');
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️  Admin sudah ada di database!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('📱 Phone:', existingAdmin.phone);
      console.log('✓ Verified:', existingAdmin.isVerified);
      
      console.log('\n🔄 Updating admin password dan data...');
      
      // Hash password baru
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Update admin
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true; // Pastikan verified
      existingAdmin.phone = adminPhone;
      existingAdmin.otp = undefined;
      existingAdmin.otpExpiry = undefined;
      
      await existingAdmin.save();
      console.log('✅ Admin berhasil diupdate!');
      
    } else {
      console.log('📝 Creating new admin...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Buat admin baru
      const admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: 'admin',
        isVerified: true, // Admin langsung verified
      });

      console.log('✅ Admin berhasil dibuat!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Role:', admin.role);
      console.log('📱 Phone:', admin.phone);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📝 KREDENSIAL LOGIN ADMIN:');
    console.log('='.repeat(50));
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('='.repeat(50));
    
    console.log('\n💡 Tips:');
    console.log('1. Gunakan kredensial di atas untuk login');
    console.log('2. Login di halaman yang sama dengan user biasa');
    console.log('3. Setelah login, Anda akan auto-redirect ke dashboard admin');
    
    // Test login
    console.log('\n🧪 Testing password verification...');
    const testAdmin = await User.findOne({ email: adminEmail });
    const isPasswordValid = await bcrypt.compare(adminPassword, testAdmin.password);
    console.log('Password verification:', isPasswordValid ? '✅ VALID' : '❌ INVALID');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

setupAdmin();