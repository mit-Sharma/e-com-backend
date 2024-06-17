import {Order} from "../models/orders.model.js"
import { Product } from "../models/product.model.js"
import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"

const createOrder=asynchandler(async(req,res)=>{
    const 
    { shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shppingAmount,
        totalAmount
          }=req.body;

          const order=await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            taxAmount,
            shoppingAmount,
            totalAmount,
            user:req.user._id
          })

          res
          .status(200)
          .json({
            success:true,
            order
          })
})

const getOrder=asynchandler(async(req,res)=>{
    const order=await Order.findById(req.params.id).populate('user','name email');
    if(!order)
        {
            throw new ApiError(401,"order does not exist")
        }
        res
        .status(200)
        .json({
            order
        })
})

const getLoggedInOrder=asynchandler(async(req,res)=>{
    const order=await Order.find({user:req.user._id})
    if(!order)
        {
            throw new ApiError(401,"order does not exist")
        }
        res
        .status(200)
        .json({
            order
        })

})

const getAllOrder=asynchandler(async(req,res)=>{

    const order=await Order.find()

    res.staus(200).json({
        order
    })
})

const adminUpdateOrder=asynchandler(async(req,res)=>{
    const order=await Order.findById(req.params.id)
    if(order.orderStatus==="Delievered")
        {
            throw new ApiError(401,"order is already marked for delieveries")
        }
    order.orderStatus=req.body.orderStatus;
    order.orderItems.forEach(async pro => {
        await updateProductStock(pro.product,pro.quantity)
    });
    await order.save()
    res.status(200).json({
        order
    })

})

async function updateProductStock(productId,quantity)
{
    const product=await Product.findById(productId)
    product.stock=product.stock-quantity
    await product.save({validateBeforeSave:false})

}

const adminDeleteOrder=BigPromise(async (req,res)=>{

    const order=await Order.findById(req.params.id)

    await order.remove()

    res.status(200).json({
        success:true
    })
})

export{adminUpdateOrder,adminDeleteOrder,getOrder,createOrder,getLoggedInOrder,getAllOrder}