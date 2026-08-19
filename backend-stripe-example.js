// ============================================
// BACKEND: Stripe Checkout Session Creation
// ============================================
// This is what your backend POST /api/orders endpoint needs

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  try {
    const {
      packageId,
      voucherCode,
      fullName,
      email,
      phone,
      instagramUsername,
      amount,
      discount
    } = req.body;

    // Calculate total
    const totalAmount = amount - (discount || 0);

    // 1. Create order in database (pending status)
    const orderId = generateUUID(); // Your database logic here
    
    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Giveaway Package - ${packageId}`,
              description: voucherCode ? `Promo: ${voucherCode}` : undefined,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      
      // ⚠️ CRITICAL: These URLs must be set correctly
      success_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      
      customer_email: email,
      metadata: {
        orderId: orderId,
        packageId: packageId,
        fullName: fullName,
        phone: phone,
        instagramUsername: instagramUsername || '',
        voucherCode: voucherCode || '',
      },
    });

    // 3. Save session ID to order
    // UPDATE order SET stripeSessionId = session.id WHERE id = orderId

    // 4. Return response
    res.json({
      orderId: orderId,
      sessionId: session.id,
      paymentUrl: session.url, // This is the Stripe checkout URL
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/orders/confirm
app.post('/api/orders/confirm', async (req, res) => {
  try {
    const { sessionId } = req.body;

    // 1. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Verify payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: session.payment_status
      });
    }

    // 3. Get orderId from metadata
    const orderId = session.metadata.orderId;

    // 4. Update order status to confirmed (idempotent check)
    // const order = await db.orders.findById(orderId);
    // if (order.status === 'confirmed') {
    //   return res.json({ message: 'Already confirmed', order });
    // }
    // await db.orders.update(orderId, { status: 'confirmed' });

    res.json({
      message: 'Order confirmed successfully',
      order: { id: orderId, status: 'confirmed' }
    });
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// GET /api/orders/:orderId
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Fetch order from database
    // const order = await db.orders.findById(orderId);
    
    res.json({
      order: {
        id: orderId,
        // ... other order fields
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});
