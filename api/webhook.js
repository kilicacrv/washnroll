const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabaseUrl = 'https://fwdlzijqvcalwmibkdsk.supabase.co';
const supabaseKey = 'sb_publishable_ATWyF8mF33kenQoVQvnejA_kQFfAveW'; // Public key is fine if RLS allows updates
const supabase = createClient(supabaseUrl, supabaseKey);

// Need to read raw body for Stripe signature validation
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.client_reference_id;

    if (bookingId) {
      console.log(`Payment successful for booking ID: ${bookingId}`);
      
      // Update Supabase booking status to paid
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating Supabase:', error);
        return res.status(500).send('Database update failed');
      }
    }
  }

  res.status(200).json({ received: true });
};
