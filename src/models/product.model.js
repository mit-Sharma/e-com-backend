import mongoose ,{Schema} from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from "crypto"

const productSchema=new mongoose.Schema({

    name:{
        type:String,
        required:[true,'Please provide a product name'],
        trim:true,
        maxlength:[120,'Product name should not exceed 120 characters']
    },
    price:{
        type:Number,
        required:[true,'Please provide a product price'],
        maxlength:[120,'Product price should not exceed 5 characters']
    },
    description:{
        type:String,
        required:[true,'Please provide a product description'],
    },
    photos:[
        {
           type:String,
           required:true
        }
        
    ],
    stock:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:[true,'Please select the category from short-sleeves,long-sleeves,sweat-shirt,hoodies'],
        enum:{
            values:[
                'short-sleeves','long-sleeves','sweat-shirt','hoodies'
            ],
            message:'Please provide select the category frpom the given option'
        }
    },
    brand:{
        type: String, //cloudinary url
        required: [true,'Please provide the brand name']
    },
    AverageRating:{
        type: Number, //cloudinary url
        default:0
    },
    numberofreviews:{
        type:Number, //cloudinary url
        default:0
    },
    reviews:[
    {
       user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
       },
       name:{
        type:String,
        required:true
       },
       rating:{
        type:Number,
        required:true
       },
       comment:{
        type:String,
        required:true
       }
    }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
       },
},{timestamps:true})

export  const Product=mongoose.model('Product',productSchema);





