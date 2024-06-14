const stripe=require('stripe')(process.env.STRIPE_SECRET)
import { asynchandler } from '../utils/asynchandler.js'

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