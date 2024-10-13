import { User } from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookieToken } from "../utils/cookietoken.js";
import { mailHelper } from "../utils/emailService.js";
import { Product } from "../models/product.model.js";
import {v2 as cloudinary} from "cloudinary";
import { whereclause } from "../utils/whereclause.js";

const addProduct=asynchandler(async(req,res)=>{
    let imageArray=[];
    if(!req.files)
        {
            throw new ApiError(401,"Images are required")
        }
    if(req.files)
        {
            for(let index=0;index<req.files.photos.length;index++)
                {
                    const photoLocalPath =req.files.photos[index].path;
                    const photo=await uploadOnCloudinary(photoLocalPath);
                    imageArray.push(photo.url);  
                }
               
        } 
        req.body.photos=imageArray;
        req.body.user=req.user.id;
        const product=await Product.create(req.body);
        return res
        .status(200)
        .json(new ApiResponse(200,product,"product added successfully"))

}) 
const getAllProduct=asynchandler(async(req,res)=>{
    const resPerPage=6;
    const productCount=await Product.countDocuments();
    const productObject=new whereclause(Product.find(),req.query).search().filter().pager(resPerPage)
    let products=await productObject.base.clone()
    res.status(200).json({
        success:true,
        products,
    })
})

exports.adminGetAllProduct=asynchandler(async(req,res,next)=>{

    const product=await Product.find()

    res.status(200).json({
        success:true,
        product
    })
 })

 exports.getSingleProduct=asynchandler(async(req,res)=>{

    const id=req.params.id;
    const product=await Product.findById(id);

    if(!product){
    throw new ApiError(400,"product does not exist")
    }

    res.status(200).json({
        success:true,
        product
    })
 })

 const adminupdateSingleProduct=asynchandler(async(req,res)=>{

    const product=await Product.findById(req.params.id)

    if(!product){
        throw new ApiError(400,"product does not exist");

    }
    let imageArray=[]

    if(req.files){
        for(let index=0;index<product.photos.length;index++){

            await cloudinary.v2.uploader.destroy(product.photos[index].id)
        }
    }

         for(let index=0;index<req.files.photos.length;index++){
           const photoLocalPath=req.files.photos[index].path;
           const photo=await uploadOnCloudinary(photoLocalPath);
           imageArray.push(photo.url);
        }

        req.body.photos=imageArray;
        req.body.user=req.user.id;
    

    const Updatedproduct=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,                                         
        runValidators:true,
        useFindAndModify:false                 
        
    });

    return res.
    status(200).
    json(new ApiResponse(200,Updatedproduct,"product updated successfully")
       
    )


 })

 const adminDeleteSingleProduct=asynchandler(async(req,res)=>{

    const product=await Product.findById(req.params.id)

    if(!product){
        throw new ApiError(400,"product does not exist");

    }
   
    for(let index=0;index<product.photos.length;index++){

        await cloudinary.v2.uploader.destroy(product.photos[index].id)
    }


    await product.remove()

    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })


 })

 const addReview=asynchandler(async(req,res)=>{
    const {rating,comment,productId}=req.body
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }
    const product=await Product.findById(productId)
    const alreadyReview=product.reviews.find(
        (rev)=>rev.user.toString()===req.user._id.toString()
    )
    if(alreadyReview)
        {
            product.reviews.forEach((rev) => {
                if(rev.user.toString()===req.user._id.toString())
                    {
                        rev.comment=comment
                        rev.rating=rating
                    }
                
            });
        }
        else{
            product.reviews.push(review);
            product.numberofreviews=product.reviews.length
        }
        let totalRating=0;
        product.reviews.forEach(rev => {
           totalRating+=rev.rating 
        });
        if(product.reviews.length!=0)
            totalRating=totalRating/numberofreviews
        product.AverageRating=totalRating

        await product.save({
            validateBeforeSave:false
        })
        res.status(200).json({
            success:true
        })
 })

 const deleteReview=asynchandler(async(req,res)=>{
    const {productId}=req.body;
    const product=await Product.findById(productId);
    const reviews=product.reviews.filter(
        (rev)=>rev.user.toString()!=req.user._id.toString()
    )

    product.numberofreviews=reviews.length;

    let avg=0;

    reviews.forEach((rev)=>avg+=rev.rating)
    if(reviews.length!=0)
        {
            avg=avg/reviews.length;
        }
        product.AverageRating=avg;
        await Product.findByIdAndUpdate(productId,{
            reviews,
            Averagerating,
            numberOfReviews
        },{
            new:true, 
            runValidators:true,
            useFindAndModify:false
        })
        res.status(200).json({
            success:true
        })
 })

 const getOnlyReviewsForOneProduct=asynchandler(async (req,res)=>{
    const product=await Product.findById(req.body);

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
 })
export {addProduct,adminupdateSingleProduct,adminDeleteSingleProduct,getSingleProduct,getAllProduct,adminGetAllProduct,addReview,deleteReview,getOnlyReviewsForOneProduct}