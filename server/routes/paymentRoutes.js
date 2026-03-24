const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Crear PaymentIntent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ mensaje: 'Monto inválido' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe trabaja en centavos
      currency: 'mxn',
      payment_method_types: ['card']
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: 'Error al crear el PaymentIntent' });
  }
});

module.exports = router;