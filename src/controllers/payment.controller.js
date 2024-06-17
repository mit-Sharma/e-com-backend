const stripe=require('stripe')(process.env.STRIPE_SECRET)
import { asynchandler } from '../utils/asynchandler.js'
const Razorpay = require('razorpay');


const captureStripePayment=asynchandler(async(req,res,next)=>{
    const paymentIntent=await stripe.paymentIntents.create({
        amount:req.body.amount,
        currency:'inr',
        payment_method_types:['card'],
        metadata:{
            order_id:req.body.order_id
        }
    })
res.status(200).json({
    success:true,
    client_secret:paymentIntent.client_secret,
})
})

const captureRazorpayPayment=asynchandler(async(req,res)=>{
    const amount=req.body.amount
    var instance=new Razorpay({key_id:process.env.RAZORPAY_API_KEY,key_secret:process.env.RAZORPAY_SECRET})
    const myorder=await instance.orders.create({
        amount:amount*100,
        currency:"INR"
    })
    res.status(200).json({
        success:true,
        amount,
        myorder
    })

})
const sendStripKey=asynchandler(async (req,res)=>{
    res.status(200).json({
        stripeKey:process.env.STRIPE_PUBLISHABLE_KEY
    })
})

const sendRazorpayKey=asynchandler(async (req,res)=>{
    res.status(200).json({
        razorpayKey:process.env.RAZORPAY_API_KEY
    })
})

export {sendRazorpayKey,sendStripKey,captureRazorpayPayment,captureStripePayment}


