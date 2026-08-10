const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { plan_name, grand_total, booking_id, customer_name, vehicle_type, is_subscription } = req.body;

    if (!plan_name || !grand_total || !booking_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const domain = req.headers.origin || 'https://washnroll.ae';

    const priceData = {
      currency: 'aed',
      product_data: {
        name: `Wash N Roll - ${plan_name}`,
        description: `Vehicle: ${vehicle_type} | Customer: ${customer_name}`,
      },
      unit_amount: Math.round(grand_total * 100), // Stripe expects amounts in cents/fils
    };

    if (is_subscription) {
      priceData.recurring = { interval: 'month' };
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: is_subscription ? 'subscription' : 'payment',
      success_url: `${domain}/success.html`,
      cancel_url: `${domain}/cancel.html`,
      client_reference_id: booking_id, // Pass booking ID to webhook
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
};
