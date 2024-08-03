import { User } from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookieToken } from "../utils/cookietoken.js";
import { mailHelper } from "../utils/emailService.js";
import { upload } from "../middlewares/multer.middleware.js";

        const generateAccessandRefreshToken=async(userId)=>{
        try {
        const user=await User.findById(userId)
        const accessToken=user.getAccessToken();
        const refreshToken=user.getRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken}
        }   catch (error) {
        throw new ApiError(500,"something went wrong while generating access token and refresh token");
        
    }
}

        const registerUser=asynchandler(async(req,res)=>{
        const photoLocalPath =req.files?.photo[0]?.path;
        if(!photoLocalPath){
        throw new ApiError(400, "Photo is missing!")
        }
        const {name,email,password,role}=req.body;

        if([name,email,password].some((field)=>field?.trim ===""))
        {
         throw new ApiError(400,"All fields are required");     
        }
        const existedUser=await User.findOne({
        $or:[{"email":email,"name":name}]
        }) 
        if(existedUser)
        {
         throw new ApiError(409,"email or name is already in use")    
        }
        const photo=await uploadOnCloudinary(photoLocalPath);
        if(!photo)
            {
                throw new ApiError(400, "Photo is missing!");
            } 
        const user=await User.create({
                name:name.toLowerCase(),
                photo: photo.url,
                email,
                password,
                role
            });
        const createdUser=await User.findById(user._id).select("-password");
        if(!createdUser)
            {
                throw  new ApiError(500, "Server went wrong while registering the user");
            } 
        return res.status(201).json(
            new ApiResponse(200,createdUser,"user is successfully registered")
        )
        })
        
            const loginUser = asynchandler(async (req,res)=>{
            console.log(req.body);
            const {name,email,password}=req.body;
            if(!(name||email))
            {
                throw new  ApiError(400,"Name or Email is required");
            }
             
            const user=await User.findOne({
                $or:[{name},{email}]
            })
        
            if(!user)
            {
                throw new ApiError(404,"User does not exist")
            }
            const isPasswordValid=await user.isValidatePassword(password);
        
            if(!isPasswordValid){
                throw new ApiError(401,"invalid user credentials");
            }
            const {accessToken,refreshToken}=await generateAccessandRefreshToken(user._id);
            const loggedInUser=await User.findById(user._id).select('-password -refreshToken');
            const options={
                httpOnly: true,
                secure: true
            }
            return res
            .status(200)
            .cookie( 'accessToken', accessToken ,options)
            .cookie('refreshToken', refreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,accessToken,refreshToken
                    },
                    "User logged in successfully"
                )
            )
        
        
        })

             const logoutuser= asynchandler(async(req,res)=>{
                await User.findByIdAndUpdate(
                    req.user._id,
                    {
                        $set:{
                            refreshToken:undefined
                        }
                    },
                    {
                        new:true
                    }
                )
                const options={
                    httpOnly:true,
                    secure:true
                }

                return res
                .status(200)
                .clearCookie("accesstoken",options)
                .clearcookie("refreshToken",options)
                .json(new ApiResponse(200,{},'Logged out successfully'))

            })
            const refreshAccessToken= asynchandler(async (req,res)=> {
                const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
                
                if(!incomingRefreshToken){
                    throw new ApiError(401, "Unauthorized request");
                 }
                 try {
                    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
               
                    const user=await User.findById(decodedToken?._id);
               
                    if(!user){
                       throw new ApiError(401, "invalid refresh token");
                    }
                    
                    if( incomingRefreshToken != user?.refreshToken){
                       throw new ApiError(401, "Refresh token is expired or used");
                    }
               
                    const options={
                       httpOnly:true,
                       secure:true
                    }
                     const {accessToken,newrefreshToken}= await generateAccessAndRefreshToken(user._id);
               
                     return res
                     .status(200)
                     .cookie("accessToken",accessToken,options)
                     .cookie("refreshToken",newrefreshToken,options)
                     .json(
                       new ApiResponse(200,{
                           accessToken,refreshToken: newrefreshToken},"New Access Token Generated")
                       )
                 } catch (error) {
                    return new ApiError(401, error?.message ||  "Invalid refresh token");
                    }
                })


             const forgetPassword=asynchandler(async(req,res)=>{
               const {email}=req.body;
               const user= await User.findOne({email});
               console.log(user);
               if(!user)
                {
                    throw new ApiError(400,'User is not registered in the database')
                }
                const forgotToken=user.getForgetPasswordToken();
                user.save({validateBeforeSave:false})
                const myurl=`${req.protocol}://${req.get("host")}/password/${forgotToken}`;
                const message=`copy paste this link in your url and hit the enter \n\n ${myurl}`;
                try {
                    await mailHelper({
                        email:user.email,
                        subject:"password reset email",
                        message:message
                    })
                    return res
                    .status(200)
                    .json(new ApiResponse(200,{forgotToken},"email send successfully"))
                    
                } catch (error) {
                    user.forgetPasswordToken=undefined;
                    user.forgetPasswordExpiry=undefined;
                    await user.save({validateBeforeSave:false});
                    throw new ApiError(500,error.message) ;
                    
                }

            })


             const passwordReset=asynchandler(async(req,res)=>{
                const token=req.params.token
                console.log("token"+token);
                const encryptToken=crypto.createHash("sha256").update(token).digest('hex')
                console.log("encryptToken"+encryptToken);
                const user=await User.findOne({
                    encryptToken,
                    forgetPasswordExpiry:{$gt:Date.now()}
                })
                if(!user)
                    {
                        throw new ApiError(400,"forget token is expired or invalid")
                    }
                 user.password=req.body.password;
                 user.forgetPasswordToken=undefined
                 user.forgetPasswordExpiry=undefined
                 await user.save()
                 
                 cookieToken(user,res);
            })


             const changeCurrentPassword= asynchandler(async(req,res)=>{
                const {oldPassword,newPassword}=req.body;
                console.log(newPassword);
                const user=await User.findById(req.user?._id);
                const isPasswordCorrect= await user.isValidatePassword(oldPassword);
                console.log(isPasswordCorrect)
                if(!isPasswordCorrect)
                    {
                        throw new ApiError(400,"Invalid old password");
                    }
                user.password=newPassword;
                await user.save({validateBeforeSave:false})
                
                return res
                .status(200)
                .json(new ApiResponse(200,{},"Password changed successfully"));
            })


            const getCurrentUser=asynchandler(async(req,res)=>{
                return res
                .status(200)
                .json(new ApiResponse(200,req.user,"current user fetched successfully"))
            })

            const updateAccountDetails=asynchandler(async(req,res)=>{
                     const {name,email}=req.body;
                     if(!(name||email))
                        {
                            throw new ApiError(400,"all fields are required");
                        }
                     const user=await User.findByIdAndUpdate(req.user?._id,
                        {
                            $set:{
                                name:name,
                                email:email
                            }

                        },
                        {
                            new:true
                        }
                     ).select(" -password");
                     return res
                     .status(200)
                     .json(new ApiResponse(200,user,"Account details are updated successfully"));   
            })

            const updateUserPhoto=asynchandler(async(req,res)=>{
                const photoLocalPath=req.file?.path;
                if(!photoLocalPath)
                    {
                        throw new ApiError(400,"file was missing");
                    }
                 const photo=await uploadOnCloudinary(photoLocalPath) ;
                 if(!photo.url)
                    {
                        throw new ApiError(400,"Photo uploading failed");
                    } 
                 const user=await User.findByIdAndUpdate(req.user?._id,
                    {
                        $set:{
                            photo:photo.url
                        }
                    },
                    {
                    new:true
                    }
                 ).select(" -password")
                 return res
                 .status(200)
                 .json(new ApiResponse(200,user,"photo image updated successfully"))    
            })

            const adminSingleUser=asynchandler(async(req,res)=>{
                const id=req.params.id;
                const user=await User.findById(id).select(' -password -refreshToken');
                if(!user)
                    {
                        throw new ApiError(404,"user does not exist")
                    }
                return res
                .status(200)
                .json(new ApiResponse(200,user))
            })

            const adminUpdateSingleUserDetails=asynchandler(async(req,res)=>{
                const newData={
                    name:req.body.name,
                    email:req.body.email,
                    role:req.body.role
                }
                const user=await User.findByIdAndUpdate(req.params.id,newData,{
                    new:true,
                    runValidators:true,
                    useFindAndModify:false
                }).select('-refreshToken -password')
                return res
                .status(200)
                .json( new ApiResponse(200,user))
            })


             const adminDeleteSingleUserDetails=asynchandler(async (req,res)=>{

                const id=req.params.id;
            
                const user=User.findById(id)
                
                if(!user){
                     throw new ApiError(401,"No such user found");
                }
            
                
                if(user.photo)
                    await cloudinary.uploader.destroy(user.photo.id)
            
                await user.remove()
            
                res.status(200).json({
                    success:true
                   
                })
                
            })
            
               export { adminDeleteSingleUserDetails,
                adminUpdateSingleUserDetails,
                adminSingleUser,
                updateUserPhoto,
                updateAccountDetails,
                getCurrentUser,
                changeCurrentPassword,
                passwordReset,forgetPassword,
                logoutuser,
                loginUser,
                registerUser }
                








        


