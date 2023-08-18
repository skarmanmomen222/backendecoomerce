const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


const catchAsyncError = require("../middlewares/catchAsyncError")



exports.processToPayment = catchAsyncError(async (req, res, next) => {
    console.log(req.body.amount)
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'gbp',
        // payment_method: 'pm_card_visa',
      });
    console.log(paymentIntent.client_secret, "aar")

    res.status(200).json({ success: true, client_secret: paymentIntent.client_secret })
})

exports.sendStripeApiKey = catchAsyncError(async (req, res, next) => {

    res.status(200).json({ success: true, sendStripeApiKey: process.env.STRIPEPUBLICKEY })
})