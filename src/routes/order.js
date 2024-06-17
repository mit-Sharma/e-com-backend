import express from "express"
const router=express.Router()
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { adminDeleteOrder, adminUpdateOrder, createOrder, getAllOrder, getLoggedInOrder, getOrder } from "../controllers/order.controller"

router.route("/order/create").post(verifyJWT,createOrder)
router.route("/order/:id").get(verifyJWT,getOrder)
router.route("/myorder").get(verifyJWT,getLoggedInOrder)

router.route("/admin/order").get(verifyJWT,CustomRole("admin"),getAllOrder)
router.route("/admin/update/order/:id").put(verifyJWT,CustomRole("admin"),adminUpdateOrder)
router.route("/admin/delete/order/:id").delete(verifyJWT,CustomRole("admin"),adminDeleteOrder)

export {router}

