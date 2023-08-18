const { processToPayment, sendStripeApiKey } = require("../controllers/paymentController")
const { isAuthenticatedUser } = require("../middlewares/auth")

const router = require("express").Router()
router.route("/payment/process").post(isAuthenticatedUser, processToPayment)
router.route("/stripeapikey").get(isAuthenticatedUser, sendStripeApiKey)
module.exports = router  