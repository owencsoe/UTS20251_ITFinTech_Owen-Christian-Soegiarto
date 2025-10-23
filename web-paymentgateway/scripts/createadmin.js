// Script untuk membuat admin pertama
// Jalankan dengan: node scripts/createAdmin.js

require('dotenv').config({path:'.env.local'});
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Ambil dari .env
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI tidak ditemukan di file .env');
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminData = {
      name: 'Admin PHAMIE',
      email: 'admin@phamie.com',
      password: 'admin123',
      role: 'admin',
    };

    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin dengan email ini sudah ada!');
      console.log('Email:', adminData.email);
      process.exit(0);
    }

    await Admin.create(adminData);
    console.log('✅ Admin berhasil dibuat!');
    console.log('========================');
    console.log('Email:', 'admin@phamie.com');
    console.log('Password:', 'admin123');
    console.log('========================');
    console.log('⚠️  PENTING: Segera ganti password setelah login pertama!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
