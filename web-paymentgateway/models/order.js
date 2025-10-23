import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  externalId: {
    type: String,
    required: false,
  },
  xenditInvoiceId: {
    type: String,
    required: false,
  },
  invoiceUrl: {
    type: String,  // ✅ TAMBAHKAN INI
    required: false,
  },
  customerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'waiting payment', 'paid', 'lunas', 'expired', 'cancelled'],
    default: 'waiting payment',
  },
  paymentProof: {
    type: String,
    default: null,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);