import express from "express"
const router=express.Router()

router.route("/").get(home);
export {router}
