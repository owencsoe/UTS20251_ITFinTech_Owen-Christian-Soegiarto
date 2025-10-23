import connectDB from '@/lib/mongodb';
import Order from '@/models/order';

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('🔔 Webhook received:', req.body);
  console.log('📋 Headers:', req.headers);

  try {
    // Verify webhook token
    const callbackToken = req.headers['x-callback-token'];
    
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      console.log('❌ Invalid webhook token');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();

    const { 
      id,
      external_id, 
      status, 
      paid_amount,
      paid_at 
    } = req.body;

    console.log('📦 Processing:', { external_id, status });

    // Find order by external_id
    const order = await Order.findOne({ externalId: external_id });
    
    if (!order) {
      console.log('⚠️ Order not found:', external_id);
      // Still return 200 to prevent retry
      return res.status(200).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Update order based on status
    let updated = false;
    
    if (status === 'PAID') {
      order.status = 'paid';
      order.paidAt = paid_at ? new Date(paid_at) : new Date();
      updated = true;
      console.log('✅ Order marked as PAID');
    } else if (status === 'EXPIRED') {
      order.status = 'expired';
      updated = true;
      console.log('⏰ Order marked as EXPIRED');
    } else if (status === 'PENDING') {
      order.status = 'waiting payment';
      updated = true;
      console.log('⏳ Order status: PENDING');
    }

    if (updated) {
      order.xenditInvoiceId = id;
      await order.save();
      console.log('💾 Order updated successfully');
    }

    // CRITICAL: Always return 200 OK to Xendit
    return res.status(200).json({ 
      success: true,
      message: 'Webhook processed',
      order_id: order._id,
      status: order.status
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    // Still return 200 to prevent Xendit from retrying
    return res.status(200).json({ 
      success: false,
      message: error.message 
    });
  }
}