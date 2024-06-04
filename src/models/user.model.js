import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose ,{Schema} from 'mongoose';
import validator, { trim } from "validator";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide a name'],
        maxlength:[40,'Name should be under 40 characters'],
        index:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,'Please provide a email'],
        validate:[validator.isEmail,'Please enter a valid email'],
        unique:true,
        trim:true,
        index:true
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:[8,'Password should be greater than 8 characters'],
    },
    role:{
        type:String,
        default:'user'

    },
    photo:{
        type: String, //cloudinary url
        required: true
    },
    refreshToken:{
        type:String
    }  

},{timestamps:true})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,10)
})

userSchema.methods.isValidatePassword=async function(usersendpassword){
    return await bcrypt.compare(usersendpassword,this.password)
}

userSchema.methods.getAccessToken= function(){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.getRefreshToken= function(){
    jwt.sign(
        {
            _id:this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}

export const User=mongoose.model('User',userSchema)
