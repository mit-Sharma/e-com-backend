import { asynchandler } from "../utils/asynchandler.js";
const home=asynchandler(async(req,res)=>{
    res.status(200).json({
        success:true,
        greeting:"Hello from API"
    })
})
export {home}
