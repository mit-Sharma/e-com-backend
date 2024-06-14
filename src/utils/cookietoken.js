import { User } from "../models/user.model.js";
import { ApiResponse } from "./ApiResponse.js";
const cookieToken=(user,res)=>{
     const newAccessToken=user.getAccessToken()
     const newRefreshToken=user.getRefreshToken()

     const options={
        httpOnly:true,
        secure:true
     }
     user.password=undefined;
     return res
     .status(200)
     .cookie('newAccessToken',newAccessToken,options)
     .cookie('newRefreshToken',newRefreshToken,options)
     .json(new ApiResponse(200,user,"user password reset successfully"))



}
export {cookieToken};