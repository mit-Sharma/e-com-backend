const express=require('express')
const router=express.Router()
import { captureRazorpayPayment, captureStripePayment, sendRazorpayKey, sendStripKey } from '../controllers/payment.controller.js'
import { verifyJWT } from '../middlewares/auth.middlewares.js'

router.route("/stripeKey").get(verifyJWT,sendStripKey)
router.route("/razorpayKey").get(verifyJWT,sendRazorpayKey)
router.route("/capturestripe").post(verifyJWT,captureStripePayment)
router.route("/capturerazorpay").get(verifyJWT,captureRazorpayPayment)
export  {router};  